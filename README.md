# Transcribe — Audio to Text

A React app that transcribes live microphone audio to text in the browser,
using the Web Speech API. No backend, no API key required.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use Chrome or
Edge — the Web Speech API isn't supported in Firefox or Safari.

## Architecture

Built around a ports-and-adapters split so the UI never depends on a
specific transcription engine (Dependency Inversion Principle):

```
src/
  services/transcription/
    ITranscriptionService.js         # the contract (port)
    WebSpeechTranscriptionService.js # browser SpeechRecognition adapter
    TranscriptionServiceFactory.js   # picks which adapter to construct
  hooks/
    useTranscription.js              # owns all transcription state
  components/
    Header, StatusBadge, WaveformVisualizer,
    RecordButton, LanguageSelector, ErrorBanner, TranscriptPanel
    # each renders one thing and takes plain props (Single Responsibility)
  utils/
    exportTranscript.js              # copy / download, no UI concerns
  constants/
    languages.js
```

### Adding a server-based provider (e.g. Whisper API)

1. Create `src/services/transcription/WhisperTranscriptionService.js`
   implementing `ITranscriptionService` (`isSupported`, `start`, `stop`,
   `setLanguage`).
2. Register it in `TranscriptionServiceFactory.js`.
3. Nothing in `useTranscription.js` or any component needs to change
   (Open/Closed Principle) — pass `createTranscriptionService('whisper')`
   instead of `'webspeech'`.

## Notes

- The waveform visualizer reads live mic levels via the Web Audio API
  `AnalyserNode`, independent of the recognition engine — a failure there
  never blocks transcription.
- Microphone permission is requested when you press Record.
