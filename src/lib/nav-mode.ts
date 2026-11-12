export type NavMode = "top" | "side";
export const NAV_MODE_KEY = "starta:navMode";

export function readNavMode(): NavMode {
  try {
    return window.localStorage.getItem(NAV_MODE_KEY) === "side" ? "side" : "top";
  } catch {
    return "top";
  }
}

export function writeNavMode(mode: NavMode) {
  try {
    window.localStorage.setItem(NAV_MODE_KEY, mode);
  } catch {
    /* storage unavailable (private mode): keep in-memory only */
  }
}
