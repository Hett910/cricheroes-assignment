"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatNrrRange, formatOvers, formatRunsRange } from "../lib/format";

const DEFAULT_OVERS = 20;
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000/api";

export default function Home() {
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState(null);

  const [yourTeam, setYourTeam] = useState("");
  const [opponentTeam, setOpponentTeam] = useState("");
  const [totalOvers, setTotalOvers] = useState(DEFAULT_OVERS);
  const [desiredPosition, setDesiredPosition] = useState(3);
  const [toss, setToss] = useState("batting-first");
  const [runs, setRuns] = useState(120);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        setTeamsLoading(true);
        const res = await fetch(`${BACKEND_URL}/teams`);
        if (!res.ok) {
          throw new Error("Unable to load teams");
        }
        const data = await res.json();
        if (data.teams.length > 0) {
          const sorted = [...data.teams].sort((a, b) => {
            if (b.points !== a.points) {
              return b.points - a.points;
            }
            if (b.nrr !== a.nrr) {
              return b.nrr - a.nrr;
            }
            return a.team.localeCompare(b.team);
          });

          setTeams(sorted);

          const defaultYourTeam = sorted[0]?.team ?? "";
          const defaultOpponent =
            sorted.find((team) => team.team !== defaultYourTeam)?.team ?? "";
          const defaultPosition =
            sorted.length >= 3 ? 3 : sorted.length > 0 ? 1 : 0;

          setYourTeam(defaultYourTeam);
          setOpponentTeam(defaultOpponent);
          setDesiredPosition(defaultPosition);
        } else {
          setTeams([]);
          setYourTeam("");
          setOpponentTeam("");
          setDesiredPosition(0);
        }
        setTeamsError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load teams.";
        setTeamsError(message);
      } finally {
        setTeamsLoading(false);
      }
    }

    fetchTeams().catch(() => {
      setTeamsLoading(false);
      setTeamsError("Failed to load teams.");
    });
  }, []);

  useEffect(() => {
    if (!yourTeam && teams.length > 0) {
      setYourTeam(teams[0].team);
    }
  }, [teams, yourTeam]);

  const opponentOptions = useMemo(() => {
    return teams.filter((team) => team.team !== yourTeam);
  }, [teams, yourTeam]);

  useEffect(() => {
    if (opponentTeam && opponentTeam.toLowerCase() === yourTeam.toLowerCase()) {
      const next = opponentOptions[0]?.team ?? "";
      setOpponentTeam(next);
    }
  }, [yourTeam, opponentOptions, opponentTeam]);

  const availablePositions = useMemo(() => {
    return Array.from({ length: teams.length }, (_, index) => index + 1);
  }, [teams.length]);

  useEffect(() => {
    if (teams.length === 0) {
      setDesiredPosition(0);
      return;
    }
    if (desiredPosition < 1 || desiredPosition > teams.length) {
      setDesiredPosition(1);
    }
  }, [teams.length, desiredPosition]);

  const submitDisabled =
    submitting ||
    teamsLoading ||
    !yourTeam ||
    !opponentTeam ||
    totalOvers <= 0 ||
    desiredPosition <= 0 ||
    runs < 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitDisabled) {
      return;
    }

    if (!teams.find((team) => team.team === yourTeam)) {
      setError("Select a valid team from the points table.");
      return;
    }

    if (!teams.find((team) => team.team === opponentTeam)) {
      setError("Select a valid opposition from the points table.");
      return;
    }

    if (yourTeam === opponentTeam) {
      setError("Your Team and Opposition must be different.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yourTeam,
          opponentTeam,
          totalOvers,
          desiredPosition,
          toss,
          runs,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Unable to compute scenario.");
      }

      const payload = await res.json();
      setResult(payload);
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : "Unable to compute scenario.";
      if (
        rawMessage.includes("Unable to find a valid restriction range") ||
        rawMessage.includes("Unable to compute chase range")
      ) {
        setError(
          "No scenario can reach that table position with these inputs. Adjust your target or match assumptions."
        );
      } else {
        setError(rawMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
          {/* Left Section: Logo + Title + Subtitle */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Cricheroes Logo"
              width={56}
              height={56}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Net Run Rate Scenario Planner
              </h1>
              <p className="text-sm text-slate-300 mt-1 sm:mt-1.5">
                Simulate your next-match performance and see if you can reach
                your target position.
              </p>
            </div>
          </div>

          {/* Right Badge */}
          <span className="mt-4 ml-16 sm:mt-0 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase text-red-50 whitespace-nowrap">
            IPL 2022 Sample Table
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
          <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-1">
              <label
                htmlFor="your-team"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Your Team
              </label>
              <select
                id="your-team"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-s-teal-1000 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                value={yourTeam}
                onChange={(event) => setYourTeam(event.target.value)}
                disabled={teamsLoading}
              >
                {teams.map((team) => (
                  <option key={team.team} value={team.team}>
                    {team.team}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="opponent-team"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Opposition
              </label>
              <select
                id="opponent-team"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-s-teal-1000 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                value={opponentTeam}
                onChange={(event) => setOpponentTeam(event.target.value)}
                disabled={teamsLoading || opponentOptions.length === 0}
              >
                {opponentOptions.map((team) => (
                  <option key={team.team} value={team.team}>
                    {team.team}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="total-overs"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Match Overs
              </label>
              <input
                id="total-overs"
                type="number"
                min={1}
                max={20}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-s-teal-1000 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                value={totalOvers}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (value <= 20) {
                    setTotalOvers(value);
                  }
                }}
              />
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="desired-position"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Desired Table Position
              </label>
              <select
                id="desired-position"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-s-teal-1000 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                value={desiredPosition}
                onChange={(event) =>
                  setDesiredPosition(Number(event.target.value))
                }
                disabled={availablePositions.length === 0}
              >
                {availablePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="sm:col-span-2">
              <legend className="mb-3 text-sm font-medium text-slate-200">
                Toss Result
              </legend>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm">
                  <input
                    type="radio"
                    name="toss"
                    value="batting-first"
                    checked={toss === "batting-first"}
                    onChange={() => setToss("batting-first")}
                    className="h-4 w-4 border-slate-600 text-emerald-400 focus:ring-emerald-500"
                  />
                  Batting First
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm">
                  <input
                    type="radio"
                    name="toss"
                    value="bowling-first"
                    checked={toss === "bowling-first"}
                    onChange={() => setToss("bowling-first")}
                    className="h-4 w-4 border-slate-600 text-emerald-400 focus:ring-emerald-500"
                  />
                  Bowling First
                </label>
              </div>
            </fieldset>

            <div className="sm:col-span-2">
              <label
                htmlFor="runs"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                {toss === "batting-first"
                  ? "Runs Scored (Batting First)"
                  : "Runs to Chase (Bowling First)"}
              </label>
              <input
                id="runs"
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-s-teal-1000 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                value={runs}
                onChange={(event) => setRuns(Number(event.target.value))}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitDisabled}
                className="w-full rounded-xl bg-linear-to-br from-slate-800 via-slate-900 to-black px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed hover: focus:ring-red-500/20 disabled:bg-gray-300 disabled:text-gray-500 shadow-2xl border-0 relative overflow-hidden group"
              >
                <span className="relative z-10 text-slate-300">
                  {submitting ? "Calculating..." : "Compute Scenario"}
                </span>
              </button>
            </div>
          </form>

          {teamsLoading && (
            <p className="mt-6 text-sm text-slate-300">
              Loading teams from the points table...
            </p>
          )}

          {teamsError && (
            <p className="mt-6 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {teamsError}
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        {teams.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-slate-100">
              Current Points Table
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900/60">
                  <tr className="text-left text-slate-300">
                    <th className="px-3 py-2 font-medium">Pos</th>
                    <th className="px-3 py-2 font-medium">Team</th>
                    <th className="px-3 py-2 font-medium">M</th>
                    <th className="px-3 py-2 font-medium">W</th>
                    <th className="px-3 py-2 font-medium">L</th>
                    <th className="px-3 py-2 font-medium">Pts</th>
                    <th className="px-3 py-2 font-medium">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => {
                    const isSelected = team.team === yourTeam;
                    const isOpponent = team.team === opponentTeam;
                    return (
                      <tr
                        key={team.team}
                        className={`border-b border-slate-800/60 ${
                          isSelected
                            ? "bg-red-500/10 text-sky-200"
                            : isOpponent
                            ? "bg-sky-500/10 text-sky-200"
                            : "text-slate-200"
                        }`}
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{team.team}</td>
                        <td className="px-3 py-2">{team.matches}</td>
                        <td className="px-3 py-2">{team.won}</td>
                        <td className="px-3 py-2">{team.lost}</td>
                        <td className="px-3 py-2">{team.points}</td>
                        <td className="px-3 py-2">{team.nrr.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Select teams directly from this table to model realistic
              scenarios.
            </p>
          </section>
        )}

        {result && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-slate-100">
              Scenario Result
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-200">
              {result.scenarioType === "batting-first" ? (
                <>
                  <p>
                    If {yourTeam} score{" "}
                    <span className="font-semibold text-red-200">
                      {runs} runs
                    </span>{" "}
                    in{" "}
                    <span className="font-semibold text-red-200">
                      {formatOvers(totalOvers)}
                    </span>{" "}
                    overs, {yourTeam} need to restrict {opponentTeam} between{" "}
                    <span className="font-semibold text-red-300">
                      {formatRunsRange(
                        result.restrictionRange.minRuns,
                        result.restrictionRange.maxRuns
                      )}{" "}
                      runs
                    </span>{" "}
                    in{" "}
                    <span className="font-semibold text-red-200">
                      {formatOvers(result.restrictionRange.overs)}
                    </span>{" "}
                    overs.
                  </p>
                  <p>
                    Revised NRR of {yourTeam} will be between{" "}
                    <span className="font-semibold text-red-200">
                      {formatNrrRange(
                        result.restrictionRange.nrrRange.min,
                        result.restrictionRange.nrrRange.max
                      )}
                    </span>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {yourTeam} need to chase{" "}
                    <span className="font-semibold text-red-200">
                      {result.chaseRange.runs} runs
                    </span>{" "}
                    between{" "}
                    <span className="font-semibold text-red-200">
                      {formatOvers(result.chaseRange.minOvers)}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-red-200">
                      {formatOvers(result.chaseRange.maxOvers)}
                    </span>{" "}
                    overs.
                  </p>
                  <p>
                    Revised NRR for {yourTeam} will be between{" "}
                    <span className="font-semibold text-red-200">
                      {formatNrrRange(
                        result.chaseRange.nrrRange.min,
                        result.chaseRange.nrrRange.max
                      )}
                    </span>
                    .
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
