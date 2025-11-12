import { jest } from "@jest/globals";

const mockLoadBaseStandings = jest.fn();
const mockFindRestrictionRange = jest.fn();
const mockFindChaseRange = jest.fn();

jest.unstable_mockModule("../../lib/standings.js", () => ({
  loadBaseStandings: mockLoadBaseStandings,
}));

jest.unstable_mockModule("../../lib/scenarioSearch.js", () => ({
  findRestrictionRange: mockFindRestrictionRange,
  findChaseRange: mockFindChaseRange,
}));

const { getTeamsService, calculateScenarioService } = await import(
  "../../services/cricketService.js"
);

describe("cricketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTeamsService", () => {
    it("returns simplified team data from standings", () => {
      mockLoadBaseStandings.mockReturnValue([
        {
          team: "Team A",
          matches: 5,
          won: 3,
          lost: 2,
          nrr: 0.1234,
          points: 6,
          extra: "ignore-me",
        },
      ]);

      const result = getTeamsService();

      expect(mockLoadBaseStandings).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          team: "Team A",
          matches: 5,
          won: 3,
          lost: 2,
          nrr: 0.1234,
          points: 6,
        },
      ]);
      expect(result[0]).not.toHaveProperty("extra");
    });
  });

  describe("calculateScenarioService", () => {
    const basePayload = {
      yourTeam: "Team A",
      opponentTeam: "Team B",
      totalOvers: 20,
      desiredPosition: 2,
      toss: "batting-first",
      runs: 150,
    };

    it("delegates to findRestrictionRange when batting first and formats response", () => {
      mockFindRestrictionRange.mockReturnValue({
        minRuns: 120,
        maxRuns: 140,
        minNrr: 1.2349,
        maxNrr: 2.3451,
      });

      const result = calculateScenarioService(basePayload);

      expect(mockFindRestrictionRange).toHaveBeenCalledWith({
        yourTeam: "Team A",
        opponentTeam: "Team B",
        totalOvers: 20,
        desiredPosition: 2,
        yourRuns: 150,
      });

      expect(result).toEqual({
        scenarioType: "batting-first",
        restrictionRange: {
          minRuns: 120,
          maxRuns: 140,
          overs: 20,
          nrrRange: {
            min: 1.235,
            max: 2.345,
          },
        },
      });
    });

    it("delegates to findChaseRange when bowling first and formats response", () => {
      mockFindChaseRange.mockReturnValue({
        minOvers: 12.4,
        maxOvers: 17.2,
        minNrr: -0.4567,
        maxNrr: 0.6789,
      });

      const result = calculateScenarioService({
        ...basePayload,
        toss: "bowling-first",
      });

      expect(mockFindChaseRange).toHaveBeenCalledWith({
        yourTeam: "Team A",
        opponentTeam: "Team B",
        totalOvers: 20,
        desiredPosition: 2,
        targetRuns: 150,
      });

      expect(result).toEqual({
        scenarioType: "bowling-first",
        chaseRange: {
          runs: 150,
          minOvers: 12.4,
          maxOvers: 17.2,
          nrrRange: {
            min: -0.457,
            max: 0.679,
          },
        },
      });
    });

    it("rethrows errors from findRestrictionRange", () => {
      const error = new Error("Unable to compute");
      mockFindRestrictionRange.mockImplementation(() => {
        throw error;
      });

      expect(() => calculateScenarioService(basePayload)).toThrow(error);
    });
  });
});
