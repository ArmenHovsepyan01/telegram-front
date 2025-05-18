'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button/Button';
import { toast } from 'react-toastify';

import CallService from '@/services/calls';

const callService = new CallService();

export default function TranscriptDownloader({ callId }) {
  const [loading, setLoading] = useState(false);

  const getTranscript = async () => {
    setLoading(true);
    try {
      const data = await callService.getCallTranscription(callId);
      const url = `${process.env.NEXT_PUBLIC_TRANSCRIPTION_URL}${data.url}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch failed with ${response.status}`);
      }
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'transcript.pdf';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error('Error while downloading PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={getTranscript}
      disabled={loading}
      text={loading ? 'Generating...' : 'Download Transcript'}
      className="max-w-fit ml-auto"
    />
  );
}
