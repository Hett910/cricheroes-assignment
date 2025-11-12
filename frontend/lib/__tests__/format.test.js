import { formatNrrRange, formatOvers, formatRunsRange } from "../format";

describe("format helpers", () => {
  describe("formatOvers", () => {
    it("formats whole overs with trailing .0", () => {
      expect(formatOvers(20)).toBe("20.0");
    });

    it("translates fractional overs into balls", () => {
      expect(formatOvers(17.2)).toBe("17.2");
      expect(formatOvers(10.5)).toBe("10.5");
    });
  });

  describe("formatRunsRange", () => {
    it("returns a single number when min equals max", () => {
      expect(formatRunsRange(150, 150)).toBe("150");
    });

    it("returns a range string otherwise", () => {
      expect(formatRunsRange(120, 140)).toBe("120 to 140");
    });
  });

  describe("formatNrrRange", () => {
    it("formats values with three decimals", () => {
      expect(formatNrrRange(-0.4567, 0.1234)).toBe("-0.457 to 0.123");
    });

    it("collapses identical values", () => {
      expect(formatNrrRange(0.3333, 0.3333)).toBe("0.333");
    });
  });
});

