import React from "react";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <label className="theme-toggle">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <span className="slider"></span>
    </label>
  );
}

export default ThemeToggle;
