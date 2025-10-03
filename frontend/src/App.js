import { useState, useEffect } from "react";
import "./App.css";
import Chat from "./components/Chat";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Echo</h1>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      <Chat />
    </div>
  );
}

export default App;
