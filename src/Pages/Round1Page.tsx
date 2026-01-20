import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round1Page.css";

type Team = {
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

  /* ---------- LOAD TEAMS ---------- */
  useEffect(() => {
    const storedTeams = JSON.parse(
      localStorage.getItem("scoreboard_teams") || "[]"
    );

    const teamList = storedTeams.map((t: any) => ({ name: t.name }));
    setTeams(teamList);

    setScores(
      teamList.map(() =>
        Object.fromEntries(SUBJECTS.map(s => [s.key, []]))
      )
    );

    setRound2Scores(teamList.map(() => ""));
  }, []);

  /* ---------- ROUND 1 ---------- */
  const toggleCircle = (
    teamIndex: number,
    subjectKey: string,
    circleIndex: number
  ) => {
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

  const finishRound1 = () => {
  const round1Data = teams.map((team, index) => ({
    teamName: team.name,
    total: calculateRound1Total(index),
    subjectScores: scores[index]
  }));

  localStorage.setItem(
    "round1_scores",
    JSON.stringify(round1Data)
  );

  localStorage.setItem("round1_locked", "true");
  setRound1Locked(true);
};


  /* ---------- ROUND 2 ---------- */
  const finishRound2 = () => {
  const round2Data = teams.map((team, index) => ({
    teamName: team.name,
    score: Number(round2Scores[index] || 0)
  }));

  localStorage.setItem(
    "round2_scores",
    JSON.stringify(round2Data)
  );

  localStorage.setItem("round2_locked", "true");
  setRound2Locked(true);
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
            <div key={tIndex} className="score-grid">
              <div className="cell team">{team.name}</div>

              {SUBJECTS.map(sub => (
                <div key={sub.key} className="cell">
                  <div className="circle-group">
                    {[0, 1, 2, 3, 4].map(c => (
                      <div
                        key={c}
                        className={`circle ${
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
            {round1Locked ? "ROUND 1 FINISHED" : "FINISH ROUND 1"}
          </button>
        </div>

        {/* ===== ROUND 2 ===== */}
        <div className="section-gap">
          <h2>Knock Out Round 2</h2>

          <div className="round2-table">
            <div className="round-header">
              <span>Team</span>
              <span>Score</span>
            </div>

            {teams.map((team, i) => (
              <div key={i} className="round2-row">
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
              {round2Locked ? "ROUND 2 FINISHED" : "FINISH ROUND 2"}
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
