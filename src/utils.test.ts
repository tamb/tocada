import { describe, it, expect } from "bun:test";
import { difference } from "./utils";

describe("utils", () => {
  it("difference", () => {
    expect(difference(1, 2)).toBe(1);
  });
});
