import { useEffect, useState } from "react";
import "../Styles/ScoreboardPage.css";

interface TeamScore {
  teamName: string;
  round1: number;
  round2: number;
  total: number;
}

const QualifierSummaryPage = () => {
  const [teams, setTeams] = useState<TeamScore[]>([]);

  useEffect(() => {
    const r1 =
      JSON.parse(localStorage.getItem("qualifierRound1Scores") || "[]");
    const r2 =
      JSON.parse(localStorage.getItem("qualifierRound2Scores") || "[]");

    const map = new Map<string, TeamScore>();

    // ✅ Load Round 1
    r1.forEach((t: any) => {
      map.set(t.teamName, {
        teamName: t.teamName,
        round1: t.score,
        round2: 0,
        total: t.score
      });
    });

    // ✅ Add Round 2
    r2.forEach((t: any) => {
      const existing = map.get(t.teamName);

      if (existing) {
        existing.round2 = t.score;
        existing.total = existing.round1 + t.score;
      } else {
        map.set(t.teamName, {
          teamName: t.teamName,
          round1: 0,
          round2: t.score,
          total: t.score
        });
      }
    });

    const result = Array.from(map.values()).sort(
      (a, b) => b.total - a.total
    );

    setTeams(result);
  }, []);

  useEffect(() => {
  const r1 =
    JSON.parse(localStorage.getItem("qualifierRound1Scores") || "[]");
  const r2 =
    JSON.parse(localStorage.getItem("qualifierRound2Scores") || "[]");
  const allTeams =
    JSON.parse(localStorage.getItem("scoreboard_teams") || "[]");

  const map = new Map<string, any>();

  r1.forEach((t: any) => {
    map.set(t.teamName, {
      name: t.teamName,
      round1: t.score,
      round2: 0,
      totalScore: t.score,
      members:
        allTeams.find((x: any) => x.name === t.teamName)?.members || []
    });
  });

  r2.forEach((t: any) => {
    const existing = map.get(t.teamName);
    if (existing) {
      existing.round2 = t.score;
      existing.totalScore += t.score;
    }
  });

  const finalResults = Array.from(map.values())
    .sort((a, b) => b.totalScore - a.totalScore);

  // ✅ SAVE FOR ROUND 3
  localStorage.setItem(
    "round3Teams",
    JSON.stringify(finalResults)
  );
}, []);


  return (
    <div className="team-bg">
      <div className="team-card">
        <h2 className="team-title">QUALIFIER SUMMARY</h2>

        <div className="score-list">
          {teams.map((team, index) => (
            <div key={team.teamName} className="score-row">
              <div className={`rank-circle rank-${index + 1}`}>
                {index + 1}
              </div>

              <span className="team-name">{team.teamName}</span>

              <span className="team-score">
                {team.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QualifierSummaryPage;
