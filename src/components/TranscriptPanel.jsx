import { useEffect, useRef, useState } from 'react';
import { copyTranscript, downloadTranscript } from '../utils/exportTranscript';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function TranscriptPanel({ segments, interimText, fullTranscript, onClear }) {
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  const handleCopy = async () => {
    await copyTranscript(fullTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const isEmpty = segments.length === 0 && !interimText;

  return (
    <section className="transcript-panel">
      <div className="transcript-panel-toolbar">
        <span className="transcript-panel-title">Transcript log</span>
        <div className="transcript-panel-actions">
          <button type="button" onClick={handleCopy} disabled={!fullTranscript}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => downloadTranscript(fullTranscript)}
            disabled={!fullTranscript}
          >
            Download .txt
          </button>
          <button type="button" onClick={onClear} disabled={isEmpty} className="danger">
            Clear
          </button>
        </div>
      </div>

      <div className="transcript-panel-body" ref={scrollRef}>
        {isEmpty ? (
          <p className="transcript-empty">
            Press Record and start speaking — your words appear here, line by line, timestamped
            as they're captured.
          </p>
        ) : (
          <>
            {segments.map((seg) => (
              <p key={seg.id} className="transcript-line">
                <span className="transcript-timestamp">{formatTime(seg.timestamp)}</span>
                <span>{seg.text}</span>
              </p>
            ))}
            {interimText && (
              <p className="transcript-line transcript-line--interim">
                <span className="transcript-timestamp">···</span>
                <span>{interimText}</span>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
