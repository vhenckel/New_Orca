/** Copia texto; usa Clipboard API e cai para textarea+execCommand se necessário. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const t = String(text ?? "").trim();
  if (!t) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch {
      /* fallback abaixo */
    }
  }

  // Fallback mais robusto para webviews/browsers que bloqueiam seleção em textarea.
  try {
    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
      event.clipboardData?.setData("text/plain", t);
    };
    document.addEventListener("copy", onCopy);
    const ok = document.execCommand("copy");
    document.removeEventListener("copy", onCopy);
    if (ok) return true;
  } catch {
    /* tenta fallback com textarea abaixo */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, t.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
