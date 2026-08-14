import { ITranscriptionService } from './ITranscriptionService';

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * WebSpeechTranscriptionService
 * ------------------------------
 * Adapter around the browser's native SpeechRecognition API. Runs entirely
 * client-side, no network round trip to us, no API key. Single
 * responsibility: own the lifecycle of one recognition session and one
 * audio-level analyser, and translate their events into the neutral
 * ITranscriptionService contract.
 *
 * @implements {ITranscriptionService}
 */
export class WebSpeechTranscriptionService extends ITranscriptionService {
  #recognition = null;
  #audioContext = null;
  #analyser = null;
  #mediaStream = null;
  #levelFrame = null;
  #onAudioLevel = null;

  isSupported() {
    return Boolean(SpeechRecognitionCtor) && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  start({
    language = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
    onEnd,
    onAudioLevel,
  }) {
    if (!this.isSupported()) {
      onError?.({
        code: 'UNSUPPORTED',
        message: 'Speech recognition is not supported in this browser. Try Chrome or Edge.',
      });
      return;
    }

    this.#onAudioLevel = onAudioLevel ?? null;
    this.#recognition = new SpeechRecognitionCtor();
    this.#recognition.lang = language;
    this.#recognition.continuous = continuous;
    this.#recognition.interimResults = interimResults;

    this.#recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk) onResult?.({ text: finalChunk, isFinal: true });
      if (interimChunk) onResult?.({ text: interimChunk, isFinal: false });
    };

    this.#recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone access was denied. Allow mic access to transcribe.',
        'no-speech': 'No speech detected. Try speaking closer to the mic.',
        'audio-capture': 'No microphone was found.',
        network: 'A network error interrupted transcription.',
      };
      onError?.({
        code: event.error || 'UNKNOWN',
        message: messages[event.error] || `Recognition error: ${event.error}`,
      });
    };

    this.#recognition.onend = () => {
      this.#stopLevelMeter();
      onEnd?.();
    };

    this.#recognition.start();
    this.#startLevelMeter(onError);
  }

  stop() {
    this.#recognition?.stop();
    this.#recognition = null;
    this.#stopLevelMeter();
  }

  setLanguage(language) {
    if (this.#recognition) this.#recognition.lang = language;
  }

  // --- Live mic level, purely for the waveform visual. Independent of
  // recognition so a failure here never breaks transcription. ---

  async #startLevelMeter(onError) {
    try {
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.#audioContext.createMediaStreamSource(this.#mediaStream);
      this.#analyser = this.#audioContext.createAnalyser();
      this.#analyser.fftSize = 256;
      source.connect(this.#analyser);

      const data = new Uint8Array(this.#analyser.frequencyBinCount);
      const tick = () => {
        this.#analyser.getByteFrequencyData(data);
        const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
        this.#onAudioLevel?.(avg / 255);
        this.#levelFrame = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      // Non-fatal: recognition can proceed without the visual meter.
      onError?.({ code: 'METER_UNAVAILABLE', message: 'Live level meter unavailable.' });
    }
  }

  #stopLevelMeter() {
    if (this.#levelFrame) cancelAnimationFrame(this.#levelFrame);
    this.#levelFrame = null;
    this.#mediaStream?.getTracks().forEach((track) => track.stop());
    this.#mediaStream = null;
    if (this.#audioContext && this.#audioContext.state !== 'closed') {
      this.#audioContext.close();
    }
    this.#audioContext = null;
    this.#analyser = null;
    this.#onAudioLevel?.(0);
  }
}
