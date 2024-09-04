import { browser } from "$app/environment";
import DarkReader from "darkreader";
import { writable, type Writable } from "svelte/store";

const LOCALSTORAGE_KEY = "darkMode";

function getIsDarkMode(): boolean {
  // Assume dark mode for SSR
  if (!browser) {
    return true;
  }

  // Check local storage for true/false first
  const darkMode = localStorage.getItem(LOCALSTORAGE_KEY);
  if (darkMode === "true") {
    return true;
  }
  if (darkMode === "false") {
    return false;
  }

  // Check for browser dark mode preference
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Check for class on html element
  const topHtml = document.getElementsByTagName("html")[0];
  return topHtml.classList.contains("dark");
}

const { subscribe, set, update } = writable<boolean>(getIsDarkMode());

function setDarkMode(isDarkMode: boolean) {
  // Do not switch to light mode if DarkReader is enabled, the colors get horrible
  if (!isDarkMode && DarkReader.isEnabled()) {
    return;
  }

  // Get root element
  const elements = document.getElementsByTagName("html");
  if (elements.length === 0) {
    return;
  }

  // Once we know we can set the mode, save it to local storage
  set(isDarkMode);

  // Set the class on the root element
  elements[0].classList.toggle("dark", isDarkMode);
}

// Listen for changes to local storage, and update the store
window.addEventListener("storage", (event) => {
  if (event.storageArea !== localStorage || event.key !== LOCALSTORAGE_KEY) {
    return;
  }

  switch (event.newValue) {
    case "true":
      setDarkMode(true);
      break;
    case "false":
      setDarkMode(false);
      break;
    case "auto":
    default:
      setDarkMode(getIsDarkMode());
      break;
  }
});

export const darkModeStore: Writable<boolean> = {
  subscribe,
  set,
  update,
};
