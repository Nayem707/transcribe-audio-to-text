import { useEffect, useRef } from 'react';

const BAR_COUNT = 48;
const BAR_GAP = 3;

/**
 * Scrolling VU-meter style bar visualizer. Keeps its own ring buffer of
 * recent levels so the animation is smooth even though React only re-renders
 * on prop change roughly once per animation frame from the parent.
 */
export function WaveformVisualizer({ level = 0, isRecording }) {
  const canvasRef = useRef(null);
  const historyRef = useRef(new Array(BAR_COUNT).fill(0.04));

  useEffect(() => {
    const history = historyRef.current;
    history.push(isRecording ? level : 0);
    history.shift();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, isRecording]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const history = historyRef.current;
    const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

    history.forEach((v, i) => {
      const clamped = Math.max(0.04, Math.min(1, v));
      const barHeight = clamped * height;
      const x = i * (barWidth + BAR_GAP);
      const y = (height - barHeight) / 2;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (isRecording) {
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(1, '#e8a33d');
      } else {
        gradient.addColorStop(0, '#4a453c');
        gradient.addColorStop(1, '#332f28');
      }
      ctx.fillStyle = gradient;
      roundRect(ctx, x, y, barWidth, barHeight, barWidth / 2);
      ctx.fill();
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="waveform">
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  );
}
