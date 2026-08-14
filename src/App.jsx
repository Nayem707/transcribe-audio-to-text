import { Header } from './components/Header';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { RecordButton } from './components/RecordButton';
import { LanguageSelector } from './components/LanguageSelector';
import { ErrorBanner } from './components/ErrorBanner';
import { TranscriptPanel } from './components/TranscriptPanel';
import { useTranscription } from './hooks/useTranscription';
import './App.css';

export default function App() {
  const {
    isSupported,
    isRecording,
    segments,
    interimText,
    fullTranscript,
    audioLevel,
    language,
    error,
    toggle,
    setLanguage,
    clear,
  } = useTranscription();

  return (
    <div className="app">
      <Header isRecording={isRecording} isSupported={isSupported} />

      <main className="console">
        <div className="console-controls">
          <RecordButton isRecording={isRecording} disabled={!isSupported} onToggle={toggle} />
          <LanguageSelector value={language} onChange={setLanguage} disabled={isRecording} />
        </div>

        <WaveformVisualizer level={audioLevel} isRecording={isRecording} />

        <ErrorBanner message={error} onDismiss={() => {}} />

        {!isSupported && (
          <p className="unsupported-note">
            This browser doesn't support the Web Speech API. Try the latest Chrome or Edge.
          </p>
        )}

        <TranscriptPanel
          segments={segments}
          interimText={interimText}
          fullTranscript={fullTranscript}
          onClear={clear}
        />
      </main>
    </div>
  );
}
