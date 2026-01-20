import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round2Page.css";

const SUBJECTS = [
  { key: "maths", label: "Maths", credit: 3 },
  { key: "science", label: "Science", credit: 3 },
  { key: "it", label: "IT", credit: 2 },
  { key: "gk", label: "GK", credit: 1 },
  { key: "sports", label: "Sports", credit: 1 }
];

interface Team {
  name: string;
  members: string[];
}

interface MemberScore {
  subject: string;
  circles: number[];
  extra: number | "";
}

const Round2Page = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<MemberScore[][]>([]);
  const [lockedTeams, setLockedTeams] = useState<boolean[]>([]);
  const [teamTotals, setTeamTotals] = useState<number[]>([]);
  const [round1Finished, setRound1Finished] = useState(false);

  const [round2Scores, setRound2Scores] = useState<(number | "")[]>([]);
  const [round2Locked, setRound2Locked] = useState(false);

  /* ===== LOAD TEAMS ===== */
  useEffect(() => {
    const topTeams = JSON.parse(localStorage.getItem("round2Teams") || "[]");
    const allTeams = JSON.parse(localStorage.getItem("scoreboard_teams") || "[]");

    const qualified: Team[] = topTeams.map((t: any) => {
      const full = allTeams.find((a: any) => a.name === t.name);
      return { name: t.name, members: full?.members || [] };
    });

    setTeams(qualified);
    setScores(
      qualified.map(team =>
        team.members.map(() => ({
          subject: "",
          circles: [],
          extra: "" // ✅ EMPTY INIT
        }))
      )
    );
    setLockedTeams(qualified.map(() => false));
    setTeamTotals(qualified.map(() => 0));
    setRound2Scores(qualified.map(() => ""));
  }, []);

  /* ===== DETECT ROUND 1 FINISH ===== */
  useEffect(() => {
    if (lockedTeams.length && lockedTeams.every(Boolean)) {
      setRound1Finished(true);
    }
  }, [lockedTeams]);

  /* ===== CIRCLE TOGGLE ===== */
  const toggleCircle = (t: number, m: number, c: number) => {
    if (lockedTeams[t]) return;

    setScores(prev =>
      prev.map((team, ti) =>
        ti !== t
          ? team
          : team.map((mem, mi) =>
              mi !== m
                ? mem
                : {
                    ...mem,
                    circles: mem.circles.includes(c)
                      ? mem.circles.filter(x => x !== c)
                      : [...mem.circles, c]
                  }
            )
      )
    );
  };

  /* ===== SCORING ===== */

  const memberTotal = (m: MemberScore) => {
    const extra = m.extra === "" ? 0 : m.extra;
    return m.circles.length * 2 + extra;
  };

  const teamTotal = (t: number) => {
    let sum = 0;

    scores[t].forEach(m => {
      const credit =
        SUBJECTS.find(s => s.key === m.subject)?.credit || 0;
      sum += memberTotal(m) * credit;
    });

    return Number((sum / 10).toFixed(2));
  };

  /* ===== FINISH TEAM ===== */
  const finishTeam = (t: number) => {
  for (const m of scores[t]) {
    if (!m.subject) {
      alert("Select subject for all members");
      return;
    }
  }

  const total = teamTotal(t);

  setLockedTeams(prev => prev.map((l, i) => (i === t ? true : l)));
  setTeamTotals(prev => prev.map((v, i) => (i === t ? total : v)));

  // ✅ SAVE QUALIFIER ROUND 1 SCORE
  const stored =
    JSON.parse(localStorage.getItem("qualifierRound1Scores") || "[]");

  const updated = [...stored.filter((x: any) => x.teamName !== teams[t].name)];

  updated.push({
    teamName: teams[t].name,
    score: total
  });

  localStorage.setItem(
    "qualifierRound1Scores",
    JSON.stringify(updated)
  );
};


  /* ===== FINISH ROUND 2 ===== */
  const finishRound2 = () => {
    setRound2Locked(true);

    const data = teams.map((t, i) => ({
      teamName: t.name,
      score: Number(round2Scores[i] || 0)
    }));

    localStorage.setItem("qualifierRound2Scores", JSON.stringify(data));
  };

  return (
    <div className="round2-bg">
      <div className="round2-card">
        <h1 className="qualifier-title">Qualifier</h1>
        <h2>Qualifier Round 1</h2>

        {teams.map((team, t) => (
          <div key={t} className="team-section">
            <h3 style={{ textAlign: "left" }}>{team.name}</h3>

            <div className="qualifier-grid header">
              <div className="cell team">Name</div>
              <div className="cell">Subject</div>
              <div className="cell">Score</div>
              <span className="cell">Extra</span>
              <div className="cell">Total</div>
            </div>



            {team.members.map((m, i) => (
              <div key={i} className="qual-row ">
                <span>{m}</span>

                <select
                  disabled={lockedTeams[t]}
                  value={scores[t][i].subject}
                  onChange={e =>
                    setScores(prev =>
                      prev.map((teamArr, ti) =>
                        ti !== t
                          ? teamArr
                          : teamArr.map((mem, mi) =>
                              mi !== i ? mem : { ...mem, subject: e.target.value }
                            )
                      )
                    )
                  }
                >
                  <option value="">Select</option>
                  {SUBJECTS.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="circle-group">
                  {[0, 1, 2, 3, 4].map(c => (
                    <div
                      key={c}
                      className={`circle ${
                        scores[t][i].circles.includes(c) ? "active" : ""
                      }`}
                      onClick={() => toggleCircle(t, i, c)}
                    />
                  ))}
                </div>

                <input
                  type="number"
                  className="extra-input"
                  disabled={lockedTeams[t]}
                  value={scores[t][i].extra}
                  placeholder=""
                  onChange={e =>
                    setScores(prev =>
                      prev.map((teamArr, ti) =>
                        ti !== t
                          ? teamArr
                          : teamArr.map((mem, mi) =>
                              mi !== i
                                ? mem
                                : {
                                    ...mem,
                                    extra:
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                  }
                            )
                      )
                    )
                  }
                />

                <span>{memberTotal(scores[t][i])}</span>
              </div>
            ))}

            {!lockedTeams[t] ? (
              <button className="finish-btn left" onClick={() => finishTeam(t)}>
                FINISH TEAM
              </button>
            ) : (
              <div className="team-total">
                Total score of {team.name} is {teamTotals[t]}
              </div>
            )}
          </div>
        ))}

        {round1Finished && (
          <>
            <h2 style={{ textAlign: "left", marginTop: "60px" }}>
              Qualifier Round 2
            </h2>

            <div className="round2-table">
              <div className="round-header">
                <span style={{ textAlign: "left" }}>Team</span>
                <span>Score</span>
              </div>

              {teams.map((team, i) => (
                <div key={i} className="round2-row">
                  <span style={{ textAlign: "left" }}>{team.name}</span>
                  <input
                    type="number"
                    className="qr2-score-input oval"
                    disabled={round2Locked}
                    value={round2Scores[i]}
                    onChange={e => {
                      const copy = [...round2Scores];
                      copy[i] =
                        e.target.value === "" ? "" : Number(e.target.value);
                      setRound2Scores(copy);
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              className="finish-btn left"
              onClick={finishRound2}
              disabled={round2Locked}
            >
              {round2Locked ? "ROUND 2 FINISHED" : "FINISH ROUND 2"}
            </button>

            {round2Locked && (
              <button
                className="finish-btn left"
                onClick={() => navigate("/qualifier-summary")}
              >
                GO TO QUALIFIER ROUND SUMMARY
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Round2Page;
