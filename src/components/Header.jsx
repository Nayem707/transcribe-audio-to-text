import { StatusBadge } from './StatusBadge';

export function Header({ isRecording, isSupported }) {
  return (
    <header className="header">
      <div className="wordmark">
        <span className="wordmark-mark">●</span>
        <span>TRANSCRIBE</span>
      </div>
      <StatusBadge isRecording={isRecording} isSupported={isSupported} />
    </header>
  );
}
