import { WebSpeechTranscriptionService } from './WebSpeechTranscriptionService';

/**
 * TranscriptionServiceFactory
 * ----------------------------
 * Single place that knows how to construct a transcription provider.
 * Today there's one adapter; adding a server-backed provider later is a
 * matter of registering it here — callers (useTranscription) never change.
 */
export function createTranscriptionService(provider = 'webspeech') {
  switch (provider) {
    case 'webspeech':
      return new WebSpeechTranscriptionService();
    default:
      throw new Error(`Unknown transcription provider: "${provider}"`);
  }
}
