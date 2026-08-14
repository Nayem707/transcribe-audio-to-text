export function RecordButton({ isRecording, disabled, onToggle }) {
  return (
    <button
      type="button"
      className={`record-btn ${isRecording ? 'record-btn--recording' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isRecording}
      aria-label={isRecording ? 'Stop transcribing' : 'Start transcribing'}
    >
      <span className="record-btn-icon" aria-hidden="true">
        {isRecording ? <span className="icon-stop" /> : <span className="icon-mic" />}
      </span>
      <span>{isRecording ? 'Stop' : 'Record'}</span>
    </button>
  );
}
