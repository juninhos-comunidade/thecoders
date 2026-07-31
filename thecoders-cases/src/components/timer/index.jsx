import { useEffect, useMemo, useState } from "react";
import "./index.css";

export default function Timer({
  value = 30 * 60,
  startSignal = false,
  autoStart = false,
  onComplete,
  size = 220,
  strokeWidth = 10,
  color = "#4A8AF7",
  trackColor = "#E9EEF8",
  textColor = "#1A2A3B",
  label = "Tempo",
}) {
  const [remaining, setRemaining] = useState(Math.max(0, Number(value) || 0));

  const shouldRun = Boolean(startSignal || autoStart);

  useEffect(() => {
    const nextValue = Math.max(0, Number(value) || 0);
    setRemaining(nextValue);
  }, [value]);

  useEffect(() => {
    if (!shouldRun || remaining <= 0) return;

    const intervalId = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          onComplete?.();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [shouldRun, onComplete]);

  const totalSeconds = Math.max(1, Number(value) || 1);
  const progress = Math.min(Math.max(remaining / totalSeconds, 0), 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const displayTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const timerStyle = useMemo(
    () => ({
      "--timer-color": color,
      "--timer-track-color": trackColor,
      "--timer-text-color": textColor,
      "--timer-size": `${size}px`,
    }),
    [color, trackColor, textColor, size]
  );

  return (
    <div className="circular-timer" style={timerStyle}>
      <div className="circular-timer__ring" style={{ width: size, height: size }}>
        <svg className="circular-timer__svg" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="circular-timer__track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />

          <circle
            className="circular-timer__progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div className="circular-timer__content">
          <span className="circular-timer__time">{displayTime}</span>
          <span className="circular-timer__label">{label}</span>
        </div>
      </div>
    </div>
  );
}
