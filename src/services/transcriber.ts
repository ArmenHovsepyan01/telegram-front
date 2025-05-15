interface TranscriberCallbacks {
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onError: (error: string) => void;
}

export default class OpenAITranscriber {
  private ws: WebSocket | null = null;
  private transcriptionContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isManualStop: boolean = false;
  private sessionTimeout: number;
  private userStream: MediaStream;
  private onInterimTranscript: (text: string) => void;
  private onFinalTranscript: (text: string) => void;
  private onError: (error: string) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(sessionTimeout: number, userStream: MediaStream, callbacks: TranscriberCallbacks) {
    this.sessionTimeout = sessionTimeout;
    this.userStream = userStream;
    this.onInterimTranscript = callbacks.onInterimTranscript;
    this.onFinalTranscript = callbacks.onFinalTranscript;
    this.onError = callbacks.onError;
  }

  private audioBufferQueue: Int16Array = new Int16Array(0);

  public async start(): Promise<void> {
    if (this.ws) return;
    try {
      const token = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      this.ws = new WebSocket(`wss://api.openai.com/v1/realtime?intent=transcription`, [
        'realtime',
        `openai-insecure-api-key.${token}`,
        'openai-beta.realtime-v1'
      ]);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.ws?.send(
          JSON.stringify({
            type: 'transcription_session.update',
            session: {
              input_audio_transcription: {
                model: 'gpt-4o-transcribe',
                language: 'en'
              },
              turn_detection: {
                prefix_padding_ms: 600,
                silence_duration_ms: 800,
                type: 'server_vad',
                threshold: 0.5
              }
            }
          })
        );
      };

      this.ws.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
      this.ws.onerror = () => this.handleError('WebSocket error');
      this.ws.onclose = () => this.reconnect();

      await this.initAudioProcessing();
    } catch (error) {
      this.onError(error instanceof Error ? error.message : 'Unknown error');
      this.stop();
    }
  }

  private handleMessage(data: any): void {
    if (data.type === 'conversation.item.input_audio_transcription.completed') {
      this.onFinalTranscript(data.transcript);
    } else if (data.type === 'error') {
      this.onError(data.error.message);
    }
  }

  private handleError(message: string): void {
    this.onError(message);
  }

  private async initAudioProcessing(): Promise<void> {
    this.transcriptionContext = new AudioContext({ sampleRate: 24000 });
    const source = this.transcriptionContext.createMediaStreamSource(this.userStream);

    const filter = this.transcriptionContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    source.connect(filter);
    await this.transcriptionContext.audioWorklet.addModule('/audio-processor.js');

    this.workletNode = new AudioWorkletNode(this.transcriptionContext, 'audio-processor');
    filter.connect(this.workletNode);

    this.workletNode.port.onmessage = (event) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const currentBuffer = new Int16Array(event.data.audio_data);
      this.audioBufferQueue = this.mergeBuffers(this.audioBufferQueue, currentBuffer);
      if ((this.audioBufferQueue.length / this.transcriptionContext!.sampleRate) * 1000 >= 500) {
        const totalSamples = Math.floor(this.transcriptionContext!.sampleRate * 0.5);
        const finalBuffer = this.audioBufferQueue.subarray(0, totalSamples);
        this.audioBufferQueue = this.audioBufferQueue.subarray(totalSamples);
        this.ws.send(
          JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: this.encodeInt16ArrayToBase64(finalBuffer)
          })
        );
      }
    };
  }

  private mergeBuffers(lhs: Int16Array, rhs: Int16Array): Int16Array {
    const mergedBuffer = new Int16Array(lhs.length + rhs.length);
    mergedBuffer.set(lhs, 0);
    mergedBuffer.set(rhs, lhs.length);
    return mergedBuffer;
  }

  private encodeInt16ArrayToBase64(int16Array: Int16Array): string {
    const bytes = new Uint8Array(int16Array.buffer);
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binaryString);
  }

  public async stop(): Promise<void> {
    this.isManualStop = true;
    this.ws?.close();
    this.ws = null;
    await this.transcriptionContext?.close();
    this.transcriptionContext = null;
    this.workletNode?.disconnect();
    this.workletNode = null;
  }

  private async reconnect() {
    if (++this.reconnectAttempts > this.maxReconnectAttempts) return;
    this.isManualStop = false;
    await this.start();
  }
}
