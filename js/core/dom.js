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

export function setHTML(id, html) {
  const node = el(id);
  if (!node) {
    return;
  }

  node.innerHTML = html == null ? "" : String(html);
}

export function clearTimer(state) {
  if (!state || state.animTimer == null) {
    return;
  }

  window.clearTimeout(state.animTimer);
  window.clearInterval(state.animTimer);
  state.animTimer = null;
}
