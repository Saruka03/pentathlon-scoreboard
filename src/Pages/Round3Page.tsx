import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round3Page.css";
import { supabase } from "../lib/supabase";

type Team = {
  id: string;
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

  /* ================= LOAD FINALISTS FROM DATABASE ================= */

  useEffect(() => {
    loadFinalists();
  }, []);

  const loadFinalists = async () => {
    // 1️⃣ Get Final round id
    const { data: finalRound } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", "Final")
      .single();

    if (!finalRound) {
      alert("Final round not found in database");
      return;
    }

    // 2️⃣ Get total scores of previous round (Qualifier)
    const { data: scores } = await supabase
      .from("scores")
      .select("team_id, points")
      .neq("sub_round", "great_mind")
      .neq("sub_round", "puzzle")
      .neq("sub_round", "buzzer");


    // 3️⃣ Get teams
    const { data: teams } = await supabase
      .from("teams")
      .select("id, name");

    if (!scores || !teams) return;

    // 4️⃣ Sum scores per team
    const map = new Map<string, number>();

    scores.forEach(s => {
      map.set(s.team_id, (map.get(s.team_id) || 0) + s.points);
    });

    // 5️⃣ Sort teams by score
    const sorted = [...teams]
      .map(t => ({
        ...t,
        total: map.get(t.id) || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 2);

    // 6️⃣ Load members for each team
    const loadTeam = async (team: any): Promise<Team> => {
      const { data: members } = await supabase
        .from("players")
        .select("name")
        .eq("team_id", team.id);

      return {
        id: team.id,
        name: team.name,
        members: members?.map(m => m.name) || []
      };
    };

    const t1 = await loadTeam(sorted[0]);
    const t2 = await loadTeam(sorted[1]);

    setTeam1(t1);
    setTeam2(t2);
  };

  /* ================= ROUND SCORES ================= */

  const [round1, setRound1] = useState<{ t1: number | ""; t2: number | "" }>({
    t1: "",
    t2: ""
  });

  const [round2, setRound2] = useState<{ t1: number | ""; t2: number | "" }>({
    t1: "",
    t2: ""
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

  const [team1Selected, setTeam1Selected] = useState<string[]>(Array(ROWS).fill(""));
  const [team2Selected, setTeam2Selected] = useState<string[]>(Array(ROWS).fill(""));

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
    let green = 0, red = 0;
    grid.forEach(row =>
      row.forEach(c => {
        if (c === "green") green++;
        if (c === "red") red++;
      })
    );
    return green * 2 - red;
  };

  /* ================= FINISH FINAL & SAVE TO DB ================= */

  const finishFinal = async () => {
    if (!team1 || !team2) return;

    setFinalFinished(true);

    const t1Buzzer = buzzerScore(team1Circles);
    const t2Buzzer = buzzerScore(team2Circles);

    const t1Total = (round1.t1 || 0) + (round2.t1 || 0) + t1Buzzer;
    const t2Total = (round1.t2 || 0) + (round2.t2 || 0) + t2Buzzer;

    // Get final round id
    const { data: finalRound } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", "Final")
      .single();

    if (!finalRound) return;

    // Save scores
    await supabase.from("scores").insert([
      { team_id: team1.id, round_id: finalRound.id, points: round1.t1 || 0, sub_round: "great_mind" },
      { team_id: team1.id, round_id: finalRound.id, points: round2.t1 || 0, sub_round: "puzzle" },
      { team_id: team1.id, round_id: finalRound.id, points: t1Buzzer, sub_round: "buzzer" },

      { team_id: team2.id, round_id: finalRound.id, points: round1.t2 || 0, sub_round: "great_mind" },
      { team_id: team2.id, round_id: finalRound.id, points: round2.t2 || 0, sub_round: "puzzle" },
      { team_id: team2.id, round_id: finalRound.id, points: t2Buzzer, sub_round: "buzzer" },
    ]);

    const winner =
      t1Total > t2Total ? team1.name :
      t2Total > t1Total ? team2.name :
      "Draw";

    navigate("/winner", {
      state: { team1, team2, t1Total, t2Total, winner }
    });
  };

  if (!team1 || !team2) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading Final...</p>;
  }

  /* ================= UI ================= */
  // 🔴 UI PART IS UNCHANGED FROM YOUR ORIGINAL


  /* ================= UI ================= */

  return (
    <div className="round2-bg">
      <div className="round2-card">
        <h2 className="final-round-title">Final Round</h2>

        <h3 className="round-title">Find the Great Mind</h3>
        <div className="round-section">

        <div className="teams-grid">
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

        <div className="round-btn-row">
          <button
            className={`round-finish-btn ${round1Finished ? "finished" : ""}`}
            onClick={() => setRound1Finished(true)}
            disabled={round1Finished}
          >
            {round1Finished ? "Finished" : "Finish Round"}
          </button>
        </div>

      </div>


        <h3 className="round-title">Puzzle Round</h3>
        <div className="round-section">

          <div className="teams-grid">
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

          <div className="round-btn-row">
            <button
              className={`round-finish-btn ${round1Finished ? "finished" : ""}`}
              onClick={() => setRound1Finished(true)}
              disabled={round1Finished}
            >
              {round1Finished ? "Finished" : "Finish Round"}
            </button>
          </div>

        </div>
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


