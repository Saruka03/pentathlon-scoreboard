import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Round2Page.css";
import { supabase } from "../lib/supabase";

const SUBJECTS = [
  { key: "maths", label: "Maths", credit: 3 },
  { key: "science", label: "Science", credit: 3 },
  { key: "it", label: "IT", credit: 2 },
  { key: "gk", label: "GK", credit: 1 },
  { key: "sports", label: "Sports", credit: 1 }
];

interface Team {
  id: string;
  name: string;
  members: { id: string; name: string }[];
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

  useEffect(() => {
    loadQualifiedTeams();
  }, []);

  const loadQualifiedTeams = async () => {
    const { data: r1 } = await supabase.from("rounds").select("id").eq("name", "Knockout 1").single();
    const { data: r2 } = await supabase.from("rounds").select("id").eq("name", "Knockout 2").single();

    if (!r1 || !r2) {
      alert("Round 1 data missing");
      return;
    }

    const { data: scores1 } = await supabase.from("scores").select("team_id, points").eq("round_id", r1.id);
    const { data: scores2 } = await supabase.from("scores").select("team_id, points").eq("round_id", r2.id);

    const totals: Record<string, number> = {};

    scores1?.forEach(s => {
      totals[s.team_id] = (totals[s.team_id] || 0) + s.points;
    });
    scores2?.forEach(s => {
      totals[s.team_id] = (totals[s.team_id] || 0) + s.points;
    });

    const sortedTeamIds = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(x => x[0]);

    const { data: teamRows } = await supabase.from("teams").select("id, name").in("id", sortedTeamIds);
    const { data: playerRows } = await supabase.from("players").select("id, name, team_id").in("team_id", sortedTeamIds);

    const finalTeams: Team[] = teamRows!.map(t => ({
      id: t.id,
      name: t.name,
      members: playerRows!.filter(p => p.team_id === t.id)
    }));

    setTeams(finalTeams);

    setScores(
      finalTeams.map(team =>
        team.members.map(() => ({
          subject: "",
          circles: [],
          extra: ""
        }))
      )
    );

    setLockedTeams(finalTeams.map(() => false));
    setTeamTotals(finalTeams.map(() => 0));
    setRound2Scores(finalTeams.map(() => ""));
  };

  useEffect(() => {
    if (lockedTeams.length && lockedTeams.every(Boolean)) {
      setRound1Finished(true);
    }
  }, [lockedTeams]);

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

  const memberTotal = (m: MemberScore) => {
    const extra = m.extra === "" ? 0 : m.extra;
    return m.circles.length * 2 + extra;
  };

  const teamTotal = (t: number) => {
    let sum = 0;
    scores[t].forEach(m => {
      const credit = SUBJECTS.find(s => s.key === m.subject)?.credit || 0;
      sum += memberTotal(m) * credit;
    });
    return Number((sum / 10).toFixed(2));
  };

  const getOrCreateRound = async (roundName: string) => {
    let { data } = await supabase.from("rounds").select("id").eq("name", roundName).single();

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

  /* ================= SAVE QUALIFIER ROUND 1 ================= */
  const finishTeam = async (t: number) => {
    for (const m of scores[t]) {
      if (!m.subject) {
        alert("Select subject for all members");
        return;
      }
    }

    const total = teamTotal(t);
    const roundId = await getOrCreateRound("Qualifier 1");

    await supabase.from("scores").delete().eq("round_id", roundId).eq("team_id", teams[t].id);

    const inserts = teams[t].members.map((player, i) => ({
      round_id: roundId,
      team_id: teams[t].id,
      player_id: player.id,
      points: Math.round(memberTotal(scores[t][i]) * 100) // ✅ scaled int
    }));

    await supabase.from("scores").insert(inserts);

    setLockedTeams(prev => prev.map((l, i) => (i === t ? true : l)));
    setTeamTotals(prev => prev.map((v, i) => (i === t ? total : v)));
  };

  /* ================= SAVE QUALIFIER ROUND 2 ================= */
  const finishRound2 = async () => {
    setRound2Locked(true);

    const roundId = await getOrCreateRound("Qualifier 2");

    await supabase.from("scores").delete().eq("round_id", roundId);

    const inserts = teams.map((t, i) => ({
      round_id: roundId,
      team_id: t.id,
      points: Math.round(Number(round2Scores[i] || 0) * 100) // ✅ scaled int
    }));

    await supabase.from("scores").insert(inserts);
  };

  /* ================= UI (100% UNCHANGED) ================= */
  // ⚠️ UI PART CONTINUES EXACTLY AS YOUR ORIGINAL FILE


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
                <span>{m.name}</span>

                <select
                  className="glass-select subject-select"
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
