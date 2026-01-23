import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round1Page.css";
import { supabase } from "../lib/supabase";

type Team = {
  id: string;
  name: string;
};

const SUBJECTS = [
  { key: "maths", credit: 3 },
  { key: "science", credit: 3 },
  { key: "it", credit: 2 },
  { key: "gk", credit: 1 },
  { key: "sports", credit: 1 },
];

const TOTAL_CREDIT = 10;

const Round1Page = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [round2Scores, setRound2Scores] = useState<(number | "")[]>([]);
  const [round1Locked, setRound1Locked] = useState(false);
  const [round2Locked, setRound2Locked] = useState(false);

  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    await loadTeams();
    await checkLocks();
  };

  /* ---------- LOAD TEAMS ---------- */
  const loadTeams = async () => {
    const { data, error } = await supabase.from("teams").select("id, name");

    if (error) {
      alert("Failed to load teams");
      console.error(error);
      return;
    }

    setTeams(data);

    setScores(
      data.map(() => Object.fromEntries(SUBJECTS.map(s => [s.key, []])))
    );

    setRound2Scores(data.map(() => ""));
  };

  /* ---------- ENSURE ROUND EXISTS ---------- */
  const getOrCreateRound = async (roundName: string) => {
    let { data } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", roundName)
      .single();

    if (!data) {
      const { data: newRound } = await supabase
        .from("rounds")
        .insert({ name: roundName, score_type: "team" })
        .select()
        .single();

      return newRound.id;
    }

    return data.id;
  };

  /* ---------- CHECK LOCKS ---------- */
  const checkLocks = async () => {
    const r1 = await supabase.from("rounds").select("id").eq("name", "Knockout 1").single();
    const r2 = await supabase.from("rounds").select("id").eq("name", "Knockout 2").single();

    if (r1.data) {
      const { data } = await supabase.from("scores").select("id").eq("round_id", r1.data.id);
      if (data && data.length > 0) setRound1Locked(true);
    }

    if (r2.data) {
      const { data } = await supabase.from("scores").select("id").eq("round_id", r2.data.id);
      if (data && data.length > 0) setRound2Locked(true);
    }
  };

  /* ---------- UI LOGIC ---------- */
  const toggleCircle = (teamIndex: number, subjectKey: string, circleIndex: number) => {
    if (round1Locked) return;

    const updated = [...scores];
    const arr = updated[teamIndex][subjectKey] || [];

    updated[teamIndex][subjectKey] = arr.includes(circleIndex)
      ? arr.filter((c: number) => c !== circleIndex)
      : [...arr, circleIndex];

    setScores(updated);
  };

  const calculateRound1Total = (teamIndex: number) => {
    let sum = 0;
    SUBJECTS.forEach(sub => {
      sum += (scores[teamIndex]?.[sub.key]?.length || 0) * sub.credit;
    });
    return Number((sum / TOTAL_CREDIT).toFixed(2));
  };

  /* ---------- SAVE ROUND 1 ---------- */
  const finishRound1 = async () => {
    const roundId = await getOrCreateRound("Knockout 1");

    // delete old
    await supabase.from("scores").delete().eq("round_id", roundId);

    const inserts = teams.map((team, index) => ({
      round_id: roundId,
      team_id: team.id,
      points: Math.round(calculateRound1Total(index) * 100)
    }));

    await supabase.from("scores").insert(inserts);

    setRound1Locked(true);
    alert("✅ Round 1 saved");
  };

  /* ---------- SAVE ROUND 2 ---------- */
  const finishRound2 = async () => {
    const roundId = await getOrCreateRound("Knockout 2");

    await supabase.from("scores").delete().eq("round_id", roundId);

    const inserts = teams.map((team, index) => ({
      round_id: roundId,
      team_id: team.id,
      points: Math.round(Number(round2Scores[index] || 0) * 100)
    }));

    await supabase.from("scores").insert(inserts);

    setRound2Locked(true);
    alert("✅ Round 2 saved");
  };

  return (
    <div className="round1-bg">
      <div className="round1-card">
        <h1 className="knockout-title">Knock Out Round</h1>
        <h2>Knock Out Round 1</h2>

        {/* ===== ROUND 1 TABLE ===== */}
        <div className="round-table">

          {/* HEADER */}
          <div className="score-grid header">
            <div className="cell team">Team</div>
            <div className="cell">Maths</div>
            <div className="cell">Science</div>
            <div className="cell">IT</div>
            <div className="cell">GK</div>
            <div className="cell">Sports</div>
            <div className="cell">Total</div>
          </div>

          {/* ROWS */}
          {teams.map((team, tIndex) => (
            <div key={team.id} className="score-grid">
              <div className="cell team">{team.name}</div>

              {SUBJECTS.map(sub => (
                <div key={sub.key} className="cell">
                  <div className="circle-group">
                    {[0, 1, 2, 3, 4].map(c => (
                      <div
                        key={c}
                        className={`circle-r1 ${
                          scores[tIndex]?.[sub.key]?.includes(c)
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleCircle(tIndex, sub.key, c)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="cell total">
                {calculateRound1Total(tIndex)}
              </div>
            </div>
          ))}
        </div>

        {/* FINISH ROUND 1 */}
        <div className="left-actions">
          <button
            className="finish-btn"
            onClick={finishRound1}
            disabled={round1Locked}
          >
            {round1Locked ? "ROUND 1 SAVED" : "SAVE ROUND 1"}
          </button>
        </div>

        {/* ===== ROUND 2 ===== */}
        <div className="section-gap">
          <h2>Knock Out Round 2</h2>

          <div className="round2-table">
            <div className="round-header">
              <span className="cell">Team</span>
              <span className="cell">Score</span>
            </div>

            {teams.map((team, i) => (
              <div key={team.id} className="round2-row">
                <span className="team-name">{team.name}</span>
                <input
                  type="number"
                  value={round2Scores[i]}
                  disabled={round2Locked}
                  onChange={e => {
                    const updated = [...round2Scores];
                    updated[i] =
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value);
                    setRound2Scores(updated);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="left-actions">
            <button
              className="finish-btn"
              onClick={finishRound2}
              disabled={round2Locked}
            >
              {round2Locked ? "ROUND 2 SAVED" : "SAVE ROUND 2"}
            </button>
          </div>

          {round2Locked && (
            <div className="left-actions">
              <button
                className="finish-btn"
                onClick={() => navigate("/round1-summary")}
              >
                GO TO ROUND 1 SUMMARY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Round1Page;
