/** Scroll la zone messages pour garder le bas visible (clavier / barre iMessage). */
export function scrollConversationToBottom(root: HTMLElement): number {
  const scroll = root.querySelector<HTMLElement>("[data-export-scroll]");
  if (!scroll) return 0;

  const maxScroll = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
  scroll.scrollTop = maxScroll;
  void scroll.offsetHeight;

  return scroll.scrollTop;
}

/** Applique le décalage de scroll dans le clone html2canvas (scrollTop ignoré). */
export function applyScrollOffsetInClone(
  root: HTMLElement,
  scrollTop: number
): void {
  if (scrollTop <= 0) return;

  const scroll = root.querySelector<HTMLElement>("[data-export-scroll]");
  if (!scroll) return;

  const inner = scroll.firstElementChild as HTMLElement | null;
  if (!inner) return;

  inner.style.transform = `translateY(-${scrollTop}px)`;
  scroll.style.overflow = "hidden";
  scroll.scrollTop = 0;
}
