export function ensureMessageMenuVisible(
  list: HTMLElement,
  messageEl: HTMLElement,
  menuEl: HTMLElement,
  padding = 12,
) {
  let listRect = list.getBoundingClientRect();
  let messageRect = messageEl.getBoundingClientRect();
  let menuRect = menuEl.getBoundingClientRect();

  if (messageRect.top < listRect.top + padding) {
    list.scrollTop -= listRect.top + padding - messageRect.top;
    listRect = list.getBoundingClientRect();
    messageRect = messageEl.getBoundingClientRect();
    menuRect = menuEl.getBoundingClientRect();
  }

  const contentBottom = Math.max(messageRect.bottom, menuRect.bottom);
  const visibleBottom = listRect.bottom - padding;
  if (contentBottom > visibleBottom) {
    list.scrollTop += contentBottom - visibleBottom;
    listRect = list.getBoundingClientRect();
    messageRect = messageEl.getBoundingClientRect();
    menuRect = menuEl.getBoundingClientRect();
  }

  return { listRect, messageRect, menuRect };
}

export function calculateMenuLiftPx(
  listRect: Pick<DOMRect, "top" | "bottom" | "height">,
  messageRect: Pick<DOMRect, "top" | "bottom" | "height">,
  menuRect: Pick<DOMRect, "bottom" | "height">,
  padding = 12,
) {
  if (listRect.height <= 0 || menuRect.height <= 0) return 0;
  if (menuRect.bottom <= listRect.bottom - padding) return 0;

  const overflow = menuRect.bottom - (listRect.bottom - padding);
  const maxLift = Math.max(
    overflow,
    messageRect.top - listRect.top + messageRect.height * 0.35,
  );
  const neededLift = Math.min(Math.ceil(overflow), Math.ceil(maxLift));
  return neededLift > 0 ? neededLift : 0;
}
