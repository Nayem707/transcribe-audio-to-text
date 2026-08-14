import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createTranscriptionService } from '../services/transcription/TranscriptionServiceFactory';

/**
 * useTranscription
 * ------------------
 * Encapsulates recording state, the growing transcript, interim (unconfirmed)
 * text, audio level, and error state. Depends only on the ITranscriptionService
 * contract via the factory — swap providers in one line, hook stays the same.
 */
export function useTranscription(initialLanguage = 'en-US') {
  const serviceRef = useRef(null);
  if (!serviceRef.current) serviceRef.current = createTranscriptionService('webspeech');

  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState([]); // [{ id, text, timestamp }]
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [language, setLanguageState] = useState(initialLanguage);
  const [error, setError] = useState(null);
  const [isSupported] = useState(() => serviceRef.current.isSupported());

  const fullTranscript = useMemo(
    () => segments.map((s) => s.text).join(' ').trim(),
    [segments]
  );

  const start = useCallback(() => {
    setError(null);
    serviceRef.current.start({
      language,
      onResult: ({ text, isFinal }) => {
        if (isFinal) {
          setSegments((prev) => [
            ...prev,
            { id: `${Date.now()}-${prev.length}`, text: text.trim(), timestamp: new Date() },
          ]);
          setInterimText('');
        } else {
          setInterimText(text);
        }
      },
      onError: ({ code, message }) => {
        if (code === 'METER_UNAVAILABLE') return; // non-fatal, transcription still works
        setError(message);
        if (code === 'UNSUPPORTED') setIsRecording(false);
      },
      onEnd: () => setIsRecording(false),
      onAudioLevel: setAudioLevel,
    });
    setIsRecording(true);
  }, [language]);

  const stop = useCallback(() => {
    serviceRef.current.stop();
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  const toggle = useCallback(() => (isRecording ? stop() : start()), [isRecording, start, stop]);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    serviceRef.current.setLanguage(code);
  }, []);

  const clear = useCallback(() => {
    setSegments([]);
    setInterimText('');
  }, []);

  // Stop cleanly if the component unmounts mid-recording.
  useEffect(() => () => serviceRef.current.stop(), []);

  return {
    isSupported,
    isRecording,
    segments,
    interimText,
    fullTranscript,
    audioLevel,
    language,
    error,
    start,
    stop,
    toggle,
    setLanguage,
    clear,
  };
}
