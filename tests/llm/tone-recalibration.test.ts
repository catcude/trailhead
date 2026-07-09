import { describe, expect, it } from "vitest";
import { recalibratedTone, stage5ToneByChoice } from "@/content/tone/tones";
import { tones } from "@/content/tone/tones";

describe("Stage-5 tone recalibration (PRD §3.3)", () => {
  it("maps every Stage-5 option id to a known tone", () => {
    for (const tag of Object.values(stage5ToneByChoice)) {
      expect(
        tones[tag],
        `tone "${tag}" must exist in the registry`,
      ).toBeDefined();
    }
  });

  it("reads Green's Stage-5 choice from s5-checkin", () => {
    expect(recalibratedTone({ "s5-checkin": "crush-it" })).toBe("hyped");
    expect(recalibratedTone({ "s5-checkin": "processing" })).toBe("reflective");
  });

  it("reads Yellow's Stage-5 choice from s5", () => {
    expect(recalibratedTone({ s5: "nervous" })).toBe("reassuring");
    expect(recalibratedTone({ s5: "idk" })).toBe("grounding");
  });

  it("returns undefined before any Stage-5 pick", () => {
    expect(recalibratedTone({})).toBeUndefined();
    expect(recalibratedTone({ "s1-mind-scan": "whatever" })).toBeUndefined();
  });

  it("returns undefined for an unrecognized Stage-5 option", () => {
    expect(recalibratedTone({ "s5-checkin": "mystery" })).toBeUndefined();
  });
});
