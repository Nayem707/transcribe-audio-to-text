export function StatusBadge({ isRecording, isSupported }) {
  if (!isSupported) {
    return <span className="status-badge status-badge--off">UNSUPPORTED</span>;
  }
  return (
    <span className={`status-badge ${isRecording ? 'status-badge--live' : 'status-badge--idle'}`}>
      <span className="status-dot" />
      {isRecording ? 'ON AIR' : 'STANDBY'}
    </span>
  );
}
