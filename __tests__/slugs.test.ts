import { encodeSlug, decodeSlug } from "@/lib/slugs";

describe("encodeSlug / decodeSlug", () => {
  it("round-trips lat, lng, and address", () => {
    const slug = encodeSlug(40.7128, -74.006, "123 Main Street");
    const decoded = decodeSlug(slug);
    expect(decoded.lat).toBeCloseTo(40.7128, 4);
    expect(decoded.lng).toBeCloseTo(-74.006, 4);
    expect(decoded.address).toBe("123 Main Street");
  });

  it("strips special characters from address", () => {
    const slug = encodeSlug(0, 0, "123 Main St. #4!");
    const decoded = decodeSlug(slug);
    expect(decoded.address).toBe("123 Main St 4");
  });

  it("handles negative coordinates", () => {
    const slug = encodeSlug(-33.8688, 151.2093, "Sydney");
    const decoded = decodeSlug(slug);
    expect(decoded.lat).toBeCloseTo(-33.8688, 4);
    expect(decoded.lng).toBeCloseTo(151.2093, 4);
  });

  it("rounds coordinates to 4 decimal places", () => {
    const slug = encodeSlug(40.712776543, -74.005974321, "Test");
    expect(slug).toContain("40.7128");
    expect(slug).toContain("-74.0060");
  });
});
