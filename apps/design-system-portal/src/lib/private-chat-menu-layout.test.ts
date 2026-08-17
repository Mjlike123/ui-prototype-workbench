import { describe, expect, it } from "vitest";
import {
  calculateMenuLiftPx,
  ensureMessageMenuVisible,
} from "./private-chat-menu-layout";

function createRect(
  top: number,
  height: number,
  left = 0,
  width = 375,
): DOMRect {
  return {
    top,
    bottom: top + height,
    left,
    right: left + width,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("private-chat-menu-layout", () => {
  it("scrolls a bottom message into view before measuring menu lift", () => {
    const list = document.createElement("main");
    const message = document.createElement("article");
    const menu = document.createElement("div");
    list.append(message);
    message.append(menu);
    document.body.append(list);

    Object.defineProperty(list, "scrollTop", {
      writable: true,
      value: 0,
    });
    Object.defineProperty(list, "scrollHeight", { value: 1200 });
    Object.defineProperty(list, "clientHeight", { value: 400 });

    list.getBoundingClientRect = () => createRect(100, 400);
    message.getBoundingClientRect = () => createRect(520, 56, 100, 200);
    menu.getBoundingClientRect = () => createRect(580, 160, 100, 112);

    ensureMessageMenuVisible(list, message, menu);

    expect(list.scrollTop).toBe(252);

    list.remove();
  });

  it("still spring-lifts when the menu remains clipped at max scroll", () => {
    const lift = calculateMenuLiftPx(
      createRect(100, 400),
      createRect(420, 56, 100, 200),
      createRect(480, 160, 100, 112),
    );

    expect(lift).toBe(152);
  });
});
