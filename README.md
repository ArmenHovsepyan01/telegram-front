# Telegram Front

Frontend for a modern real-time Telegram-like communication platform built with **Next.js 14**, **React**, **TypeScript**, and **Socket.IO**.

## Overview

This project provides the client application for:

- secure authentication and session flow
- real-time chat experience
- online presence and typing indicators
- WebRTC-based video calling integration
- AI-enhanced communication workflows

It is designed to work with the companion backend API/WebSocket server.

## Core Features

### 1) Authentication & Access Control

- Registration and login flows
- Form-level validation with Yup + Formik
- Token-based authentication via cookies
- Route protection through Next.js middleware
- User profile bootstrap after auth

### 2) Real-Time Chat

- Chat list and one-to-one conversation view
- Instant message delivery with socket events
- Message optimistic updates + acknowledgement handling
- Typing indicator support
- Online/offline user presence updates

### 3) Video Communication

- Integrated video call entry from chat
- WebRTC peer connection flow
- Local and remote media stream rendering
- Real-time signaling over Socket.IO

### 4) AI & Transcription-Ready Experience (Strong Side)

This frontend is structured to support advanced AI communication features, including:

- **Live transcription** powered by **OpenAI models** during ongoing calls/sessions
- **Post-call transcription summaries** for fast conversation recap
- **AI agent support** for intelligent assistance, follow-up, and context-aware chat workflows

These capabilities are enabled through backend integrations while this client handles the UX, real-time events, and user interaction flow.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Socket.IO Client
- Axios
- SWR
- Formik + Yup
- Tailwind CSS + SCSS
- Headless UI
- simple-peer / WebRTC

## Project Structure

Key areas:

- `src/app` – routes and page-level modules
- `src/components` – reusable UI and chat/video components
- `src/providers` – auth and socket providers
- `src/services` – API service layer
- `src/utilis/hooks` – real-time and WebRTC hooks
- `src/utilis/forms` – form configs and validation schemas

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000
```

`NEXT_PUBLIC_WEBSOCKET_URL` is optional; if omitted, the app falls back to `http://localhost:5000`.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

Open: `http://localhost:3000`

## Available Scripts

- `npm run dev` – start dev server
- `npm run build` – create production build
- `npm run start` – run production server
- `npm run lint` – run ESLint

## Why This Frontend Is Strong

- Real-time-first architecture for chat/call interactions
- Clear separation between API/services, providers, and UI
- Scalable foundation for AI-driven communication experiences
- Production-friendly auth routing and session handling
- Smooth path for voice intelligence features (live transcripts + after-call summaries + AI agent support)
