import { describe, expect, it } from "vitest";
import {
  isPrototypeTabSwitch,
  shouldPrototypePop,
  shouldPrototypePush,
} from "./prototype-app-navigation";

describe("prototype-app-navigation", () => {
  it("treats bottom-tab changes as instant tab switches", () => {
    expect(isPrototypeTabSwitch("toptop", "message")).toBe(true);
    expect(shouldPrototypePush("toptop", "message")).toBe(false);
  });

  it("pushes when opening secondary pages from primary", () => {
    expect(shouldPrototypePush("toptop", "search")).toBe(true);
    expect(shouldPrototypePush("me", "settings")).toBe(true);
    expect(shouldPrototypePush("message", "private-chat")).toBe(true);
  });

  it("pops when returning to primary destinations", () => {
    expect(shouldPrototypePop("search", "toptop")).toBe(true);
    expect(shouldPrototypePop("settings", "me")).toBe(true);
    expect(shouldPrototypePop("search", "message")).toBe(true);
    expect(shouldPrototypePop("search", "profile")).toBe(false);
  });
});
