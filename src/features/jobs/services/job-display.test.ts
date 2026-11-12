import { describe, expect, it } from "vitest";

import { formatJobLocation } from "@/features/jobs/services/job-display";

describe("job location display", () => {
  it.each([
    ["Sydney, Australia", "Australia", "Sydney, Australia"],
    ["Singapore", "Singapore", "Singapore"],
    ["Remote, Asia-Pacific", "Remote", "Remote, Asia-Pacific"],
    ["New York, United States", "United States", "New York, United States"],
    ["Bengaluru", "India", "Bengaluru, India"],
  ])("shows %s without repeating an existing country", (location, country, expected) => {
    expect(formatJobLocation({ location, country })).toBe(expected);
  });
});
