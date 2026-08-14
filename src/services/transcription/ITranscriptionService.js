/**
 * ITranscriptionService
 * ----------------------
 * Contract that every transcription provider must implement.
 *
 * This is the "port" in a ports-and-adapters layout: hooks and components
 * depend only on this shape (Dependency Inversion Principle), never on a
 * concrete engine like the browser's SpeechRecognition API. Swapping in a
 * server-side provider (Whisper, Deepgram, AssemblyAI, ...) later means
 * writing one new adapter class — nothing in the UI layer changes
 * (Open/Closed Principle).
 *
 * @interface
 */
export class ITranscriptionService {
  /** @returns {boolean} whether this provider can run in the current environment */
  isSupported() {
    throw new Error('isSupported() must be implemented');
  }

  /**
   * @param {{
   *   language: string,
   *   continuous?: boolean,
   *   interimResults?: boolean,
   *   onResult: (result: { text: string, isFinal: boolean }) => void,
   *   onError: (error: { code: string, message: string }) => void,
   *   onEnd: () => void,
   *   onAudioLevel?: (level: number) => void
   * }} options
   */
  start(options) {
    throw new Error('start() must be implemented');
  }

  stop() {
    throw new Error('stop() must be implemented');
  }

  /** @param {string} language BCP-47 language tag, e.g. "en-US" */
  setLanguage(language) {
    throw new Error('setLanguage() must be implemented');
  }
}
