import { afterEach, describe, expect, it } from "vitest";
import { paths } from "@/content";
import type { Flags } from "@/lib/flags";
import {
  assertPathServable,
  isPathAllowed,
  routeEntry,
} from "@/lib/guidepost/router";

/**
 * Red release gate (M3). Red is DOUBLE-GATED and must be structurally
 * unreachable in production until FF_RED_PATH && RED_PATH_RELEASE_APPROVED are
 * both set (only after the signed safety review). This suite is the regression
 * guard — it runs in the blocking `checks` job via `pnpm test`.
 */

const OFF: Flags = {
  bluePath: false,
  redPath: false,
  dashboardExtras: false,
  quizScoring: false,
  safetyClassifier: false,
};
const RED_ON: Flags = { ...OFF, redPath: true };
const BLUE_ON: Flags = { ...OFF, bluePath: true };

describe("Red is unreachable with flags off", () => {
  it("router entry refuses Red (and Blue), always allows Green/Yellow", () => {
    expect(routeEntry("red", OFF)).toBeNull();
    expect(routeEntry("blue", OFF)).toBeNull();
    expect(routeEntry("green", OFF)).toBe("green");
    expect(routeEntry("yellow", OFF)).toBe("yellow");
  });

  it("isPathAllowed gates Blue/Red but not Green/Yellow", () => {
    expect(isPathAllowed("red", OFF)).toBe(false);
    expect(isPathAllowed("blue", OFF)).toBe(false);
    expect(isPathAllowed("green", OFF)).toBe(true);
    expect(isPathAllowed("yellow", OFF)).toBe(true);
    // A cross-path shift into Red uses the same gate, so it is refused too.
    expect(isPathAllowed("red", BLUE_ON)).toBe(false);
  });
});

describe("Red opens only when both gate envs are set", () => {
  it("router + gate admit Red once released", () => {
    expect(routeEntry("red", RED_ON)).toBe("red");
    expect(isPathAllowed("red", RED_ON)).toBe(true);
  });
});

describe("assertPathServable — production hard backstop", () => {
  const env = process.env as { NODE_ENV?: string };
  const original = env.NODE_ENV;
  afterEach(() => {
    env.NODE_ENV = original;
  });
  function setEnv(v: string) {
    env.NODE_ENV = v;
  }

  it("throws in production for a gated path without its flag", () => {
    setEnv("production");
    expect(() => assertPathServable("red", OFF)).toThrow();
    expect(() => assertPathServable("blue", OFF)).toThrow();
    // Released / ungated paths never throw.
    expect(() => assertPathServable("red", RED_ON)).not.toThrow();
    expect(() => assertPathServable("green", OFF)).not.toThrow();
  });

  it("is a no-op outside production (preview/test can exercise gated paths)", () => {
    setEnv("test");
    expect(() => assertPathServable("red", OFF)).not.toThrow();
  });
});

describe("Red content may exist in the bundle (just not be served)", () => {
  it("is registered so it validates and preview can flip it on", () => {
    expect(paths.red?.path).toBe("red");
  });
});
