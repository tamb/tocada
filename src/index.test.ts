import { describe, it, expect } from "bun:test";
import Tocada, { useTouchEvents } from "./index";

describe("useTouchEvents", () => {
  it("should return Tocada instance", () => {
    expect(useTouchEvents("body")).toBeInstanceOf(Tocada);
  });
});

describe("Tocada", () => {
  it("accepts query string as first argument", () => {
    const touchEvents = new Tocada("body");
    expect(touchEvents.element).toBeInstanceOf(HTMLElement);
  });

  it("accepts HTMLElement as first argument", () => {
    const touchEvents = new Tocada(document.querySelector("body") as HTMLElement);
    expect(touchEvents.element).toBeInstanceOf(HTMLElement);
  });
});
