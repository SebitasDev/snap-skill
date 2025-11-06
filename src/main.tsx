import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress Porto SDK internal CSS errors that don't affect functionality
window.addEventListener('error', (event) => {
  // Check if it's the Porto SDK CSSStyleDeclaration error
  if (
    event.message?.includes('Failed to set an indexed property') &&
    event.message?.includes('CSSStyleDeclaration') &&
    event.filename?.includes('porto.js')
  ) {
    event.preventDefault(); // Prevent the error from being logged to console
    return false;
  }
});

// Also catch unhandled promise rejections that might come from Porto
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('CSSStyleDeclaration') ||
    event.reason?.stack?.includes('porto.js')
  ) {
    event.preventDefault(); // Suppress Porto SDK internal errors
  }
});

createRoot(document.getElementById("root")!).render(<App />);
