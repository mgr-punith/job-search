import { describe, expect, it } from "vitest";

import { parseSimulationEnvironment } from "@/lib/env";

describe("simulation environment", () => {
  it("uses a 30-second step by default and accepts a configured whole-second delay", () => {
    expect(parseSimulationEnvironment({})).toEqual({ DEMO_STATUS_DELAY_SECONDS: 30 });
    expect(parseSimulationEnvironment({ DEMO_STATUS_DELAY_SECONDS: "5" })).toEqual({ DEMO_STATUS_DELAY_SECONDS: 5 });
  });

  it.each(["0", "-1", "1.5", "invalid", "86401"])("rejects invalid delay %s", (value) => {
    expect(() => parseSimulationEnvironment({ DEMO_STATUS_DELAY_SECONDS: value })).toThrow();
  });
});
