import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round3Page.css";

type Team = {
  id: number;
  name: string;
  members: string[];
};

type CircleState = "empty" | "green" | "red";

const ROWS = 5;
const COLS = 5;

const createRow = (): CircleState[] => Array(COLS).fill("empty");

const Round3Page = () => {
  const navigate = useNavigate();

  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);

  /* ================= LOAD FINAL TEAMS ================= */

  useEffect(() => {
    const raw = localStorage.getItem("round3Teams");
    if (!raw) return;

    const teams = JSON.parse(raw);

    const sorted = [...teams].sort(
      (a: any, b: any) => b.totalScore - a.totalScore
    );

    const finalists = sorted.slice(0, 2).map((t: any, i: number) => ({
      id: i + 1,
      name: t.name,
      members: t.members || [],
    }));

    setTeam1(finalists[0]);
    setTeam2(finalists[1]);
  }, []);

  /* ================= ROUND SCORES ================= */

  const [round1, setRound1] = useState<{ t1: number | ""; t2: number | "" }>({
    t1: "",
    t2: "",
  });

  const [round2, setRound2] = useState<{ t1: number | ""; t2: number | "" }>({
    t1: "",
    t2: "",
  });

  const [round1Finished, setRound1Finished] = useState(false);
  const [round2Finished, setRound2Finished] = useState(false);
  const [finalFinished, setFinalFinished] = useState(false);

  /* ================= BUZZER ================= */

  const [team1Circles, setTeam1Circles] = useState<CircleState[][]>(
    Array.from({ length: ROWS }, createRow)
  );
  const [team2Circles, setTeam2Circles] = useState<CircleState[][]>(
    Array.from({ length: ROWS }, createRow)
  );

  const [team1Selected, setTeam1Selected] = useState<string[]>(
    Array(ROWS).fill("")
  );
  const [team2Selected, setTeam2Selected] = useState<string[]>(
    Array(ROWS).fill("")
  );

  const toggleCircle = (team: 1 | 2, r: number, c: number) => {
    if (finalFinished) return;

    const setter = team === 1 ? setTeam1Circles : setTeam2Circles;
    const data = team === 1 ? team1Circles : team2Circles;

    const updated = [...data];
    updated[r] = [...updated[r]];
    updated[r][c] = updated[r][c] === "green" ? "empty" : "green";
    setter(updated);
  };

  const markWrong = (team: 1 | 2, r: number, c: number) => {
    if (finalFinished) return;

    const setter = team === 1 ? setTeam1Circles : setTeam2Circles;
    const data = team === 1 ? team1Circles : team2Circles;

    const updated = [...data];
    updated[r] = [...updated[r]];
    updated[r][c] = "red";
    setter(updated);
  };

  const buzzerScore = (grid: CircleState[][]) => {
    let green = 0,
      red = 0;
    grid.forEach(row =>
      row.forEach(c => {
        if (c === "green") green++;
        if (c === "red") red++;
      })
    );
    return green * 2 - red;
  };

  /* ================= FINISH FINAL ================= */

  const finishFinal = () => {
    if (!team1 || !team2) return;

    setFinalFinished(true);

    const t1Total =
      (round1.t1 || 0) + (round2.t1 || 0) + buzzerScore(team1Circles);
    const t2Total =
      (round1.t2 || 0) + (round2.t2 || 0) + buzzerScore(team2Circles);

    const winner =
      t1Total > t2Total
        ? team1.name
        : t2Total > t1Total
        ? team2.name
        : "Draw";

    localStorage.setItem(
      "round4Results",
      JSON.stringify({
        team1,
        team2,
        team1Total: t1Total,
        team2Total: t2Total,
        winner,
      })
    );

    navigate("/winner", {
      state: {
        team1,
        team2,
        team1Total: t1Total,
        team2Total: t2Total,
        winner,
      },
    });
  };

  if (!team1 || !team2) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading Final...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="round2-bg">
      <div className="round2-card">
        <h2 className="final-round-title">Final Round</h2>

        <h3 className="round-title">Find the Great Mind</h3>
        <div className="score-row">
          <div className="team-column">
            <span className="team-name">{team1.name}</span>
            <input
              className="glass-score"
              type="number"
              value={round1.t1}
              onChange={e =>
                setRound1({ ...round1, t1: Number(e.target.value) || "" })
              }
              disabled={round1Finished}
            />
          </div>

          <div className="team-column">
            <span className="team-name">{team2.name}</span>
            <input
              className="glass-score"
              type="number"
              value={round1.t2}
              onChange={e =>
                setRound1({ ...round1, t2: Number(e.target.value) || "" })
              }
              disabled={round1Finished}
            />
          </div>
        </div>

        <button
          className="round-finish-btn"
          onClick={() => setRound1Finished(true)}
        >
          Finish Round
        </button>

        <h3 className="round-title">Puzzle Round</h3>
        <div className="score-row">
          <div className="team-column">
            <span className="team-name">{team1.name}</span>
            <input
              className="glass-score"
              type="number"
              value={round2.t1}
              onChange={e =>
                setRound2({ ...round2, t1: Number(e.target.value) || "" })
              }
              disabled={round2Finished}
            />
          </div>

          <div className="team-column">
            <span className="team-name">{team2.name}</span>
            <input
              className="glass-score"
              type="number"
              value={round2.t2}
              onChange={e =>
                setRound2({ ...round2, t2: Number(e.target.value) || "" })
              }
              disabled={round2Finished}
            />
          </div>
        </div>

        <button
          className="round-finish-btn"
          onClick={() => setRound2Finished(true)}
        >
          Finish Round
        </button>

        <h3 className="round-title">Buzzer Round</h3>

<div className="buzzer-container">

  {/* TEAM 1 */}
  <div className="buzzer-team">
    <div className="buzzer-column">

      <div className="buzzer-team-name">{team1.name}</div>

      {Array.from({ length: ROWS }).map((_, r) => (
        <div key={r} className="buzzer-row">
          <select
            className="glass-select"
            value={team1Selected[r]}
            onChange={e => {
              const copy = [...team1Selected];
              copy[r] = e.target.value;
              setTeam1Selected(copy);
            }}
          >
            <option value="">Select {team1.name} Member</option>
            {team1.members.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="circle-row">
            {team1Circles[r].map((c, i) => (
              <div
                key={i}
                className={`buzzer-circle ${c}`}
                onClick={() => toggleCircle(1, r, i)}
                onDoubleClick={() => markWrong(1, r, i)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* TEAM 2 */}
  <div className="buzzer-team">
    <div className="buzzer-column">

      <div className="buzzer-team-name">{team2.name}</div>

      {Array.from({ length: ROWS }).map((_, r) => (
        <div key={r} className="buzzer-row">
          <select
            className="glass-select"
            value={team2Selected[r]}
            onChange={e => {
              const copy = [...team2Selected];
              copy[r] = e.target.value;
              setTeam2Selected(copy);
            }}
          >
            <option value="">Select {team2.name} Member</option>
            {team2.members.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="circle-row">
            {team2Circles[r].map((c, i) => (
              <div
                key={i}
                className={`buzzer-circle ${c}`}
                onClick={() => toggleCircle(2, r, i)}
                onDoubleClick={() => markWrong(2, r, i)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>

</div>


        <button className="finish-btn" onClick={finishFinal}>
          Finish Final
        </button>
      </div>
    </div>
  );
};

export default Round3Page;


