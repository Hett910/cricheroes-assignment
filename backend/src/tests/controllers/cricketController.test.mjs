// tests/controllers/cricketController.test.mjs
import { jest } from "@jest/globals";

// ✅ Mock the services module (this replaces the real implementation)
const mockGetTeamsService = jest.fn();
const mockCalculateScenarioService = jest.fn();

jest.unstable_mockModule("../../services/cricketService.js", () => ({
  getTeamsService: mockGetTeamsService,
  calculateScenarioService: mockCalculateScenarioService,
}));

// ✅ Import controller AFTER mock registration
const { getTeams, calculateScenario } = await import(
  "../../controllers/cricketController.js"
);

describe("cricketController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTeams sends teams json", () => {
    mockGetTeamsService.mockReturnValue([
      {
        team: "Chennai Super Kings",
        matches: 7,
        won: 5,
        lost: 2,
        nrr: 0.771,
        points: 10,
      },
    ]);

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    getTeams({}, res);

    expect(res.json).toHaveBeenCalledWith({
      teams: expect.arrayContaining([
        expect.objectContaining({
          team: "Chennai Super Kings",
          matches: 7,
          won: 5,
          lost: 2,
          nrr: 0.771,
          points: 10,
        }),
      ]),
    });
  });

  it("getTeams handles service failure", () => {
    mockGetTeamsService.mockImplementation(() => {
      throw new Error("Service down");
    });

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    getTeams({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Failed to load teams." }),
    );
  });

  it("calculateScenario returns 400 on invalid body", () => {
    const req = { body: { yourTeam: "", opponentTeam: "B" } }; // invalid per schema
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    calculateScenario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it("calculateScenario returns 422 when service throws", () => {
    mockCalculateScenarioService.mockImplementation(() => {
      throw new Error("boom");
    });

    const req = {
      body: {
        yourTeam: "throw",
        opponentTeam: "B",
        totalOvers: 20,
        desiredPosition: 1,
        toss: "batting-first",
        runs: 100,
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    calculateScenario(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "boom" })
    );
  });

  it("calculateScenario returns success for valid data", () => {
    mockCalculateScenarioService.mockReturnValue({ scenarioType: "test" });

    const req = {
      body: {
        yourTeam: "Chennai Super Kings",
        opponentTeam: "Delhi Capitals",
        totalOvers: 20,
        desiredPosition: 3,
        toss: "batting-first",
        runs: 150,
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    calculateScenario(req, res);

    expect(res.json).toHaveBeenCalledWith({ scenarioType: "test" });
  });
});
