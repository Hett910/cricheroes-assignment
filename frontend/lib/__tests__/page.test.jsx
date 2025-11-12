import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../../app/page.jsx";


const mockFetch = jest.fn();

const mockTeamsResponse = [
  {
    team: "Team B",
    matches: 8,
    won: 6,
    lost: 2,
    nrr: 0.812,
    points: 12,
  },
  {
    team: "Team A",
    matches: 8,
    won: 5,
    lost: 3,
    nrr: 0.654,
    points: 10,
  },
  {
    team: "Team C",
    matches: 8,
    won: 4,
    lost: 4,
    nrr: -0.125,
    points: 8,
  },
];

describe("Home page", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("loads teams on mount and selects sensible defaults", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ teams: mockTeamsResponse }),
    });

    render(<Home />);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/teams$/),
      ),
    );

    const yourTeamSelect = await screen.findByLabelText("Your Team");
    const opponentSelect = screen.getByLabelText("Opposition");
    const positionSelect = screen.getByLabelText("Desired Table Position");

    expect(
      within(yourTeamSelect).getByRole("option", { selected: true }),
    ).toHaveValue("Team B");
    expect(
      within(opponentSelect).getByRole("option", { selected: true }),
    ).toHaveValue("Team A");
    expect(positionSelect).toHaveValue("3");

    const rows = await screen.findAllByRole("row");
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent("Team B");
  });

  it("shows a user-friendly error when the team load fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText(/network down/i)).toBeInTheDocument(),
    );
  });

  it("shows an error message when the scenario API returns an error", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ teams: mockTeamsResponse }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Unable to compute scenario." }),
      });

    render(<Home />);

    const submitButton = await screen.findByRole("button", {
      name: /compute scenario/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/scenario$/),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    expect(
      screen.getByText(/unable to compute scenario/i),
    ).toBeInTheDocument();
  });

  it("submits a scenario request and renders the result", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ teams: mockTeamsResponse }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarioType: "batting-first",
          restrictionRange: {
            minRuns: 120,
            maxRuns: 140,
            overs: 20,
            nrrRange: { min: 0.123, max: 0.456 },
          },
        }),
      });

    render(<Home />);

    const runsInput = await screen.findByLabelText(/runs scored/i);
    await userEvent.clear(runsInput);
    await userEvent.type(runsInput, "160");

    const submitButton = screen.getByRole("button", {
      name: /compute scenario/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/scenario$/),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    expect(
      mockFetch.mock.calls[1]?.[1]?.body,
    ).toMatchInlineSnapshot(
      `"{"yourTeam":"Team B","opponentTeam":"Team A","totalOvers":20,"desiredPosition":3,"toss":"batting-first","runs":160}"`,
    );

    await waitFor(() =>
      expect(screen.getByText(/scenario result/i)).toBeInTheDocument(),
    );
    const scenarioParagraphs = screen.getAllByText((_, node) =>
      node?.textContent?.toLowerCase().includes("team b score 160 runs"),
    );
    expect(scenarioParagraphs.length).toBeGreaterThan(0);
  });
});

