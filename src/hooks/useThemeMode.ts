/** @doc Reactive access to the resolved app theme ("light" | "dark"). */
import { useEffect, useState } from "react";

const read = (): "light" | "dark" =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

export function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">(read);

  useEffect(() => {
    const update = () => setMode(read());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("megsy:theme", update as EventListener);
    return () => {
      obs.disconnect();
      window.removeEventListener("megsy:theme", update as EventListener);
    };
  }, []);

  return mode;
}

export const useIsDark = () => useThemeMode() === "dark";
