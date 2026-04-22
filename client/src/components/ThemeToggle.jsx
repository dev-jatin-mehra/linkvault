import { useRef } from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const audioContextRef = useRef(null);

  const playToggleSound = () => {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const context = audioContextRef.current;
      const now = context.currentTime;
      const gain = context.createGain();
      const osc = context.createOscillator();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(isDark ? 680 : 520, now);
      osc.frequency.exponentialRampToValueAtTime(isDark ? 920 : 740, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio errors; theme toggle should always work.
    }
  };

  const handleToggle = () => {
    playToggleSound();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="group inline-flex h-9 w-18.5 items-center rounded-full border px-1 transition"
      style={{
        borderColor: "var(--border)",
        backgroundColor: isDark ? "#0f0f0f" : "#fff3d7",
      }}
      title="Toggle day/night"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-300 ${
          isDark ? "translate-x-9" : "translate-x-0"
        }`}
        style={{
          backgroundColor: isDark ? "#f5f5f5" : "#ff9f1a",
          color: isDark ? "#050505" : "#ffffff",
        }}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path
              d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M19.78 4.22l-2.12 2.12M6.34 17.66l-2.12 2.12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
