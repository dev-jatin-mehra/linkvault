import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="group inline-flex h-9 w-18.5 items-center rounded-full border px-1 transition"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-300 ${
          isDark ? "translate-x-9" : "translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--text)",
          color: "var(--bg)",
        }}
      >
        {isDark ? "D" : "L"}
      </span>
    </button>
  );
}
