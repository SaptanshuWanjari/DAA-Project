export function el(id) {
  return document.getElementById(id);
}

export function setText(id, text) {
  const node = el(id);
  if (!node) {
    return;
  }

  node.textContent = text == null ? "" : String(text);
}

// Use this only with static, in-repo templates.
export function setTrustedHTML(id, html) {
  const node = el(id);
  if (!node) {
    return;
  }

  node.innerHTML = html == null ? "" : String(html);
}

export function setHTML() {
  throw new Error(
    "setHTML is disabled; use setTrustedHTML for trusted templates only.",
  );
}

export function clearTimer(state) {
  if (!state || state.animTimer == null) {
    return;
  }

  window.clearTimeout(state.animTimer);
  window.clearInterval(state.animTimer);
  state.animTimer = null;
}
