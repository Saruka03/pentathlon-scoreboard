import { useEffect, useState } from "react";
import "../Styles/TeamSetupPage.css";
import "../Styles/ScoreboardPage.css";

interface TeamScore {
  id: number;
  name: string;
  score: number;
}

const ScoreboardPage = () => {
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = () => {
      /* ---------- LOAD TEAMS ---------- */
      const storedTeams = JSON.parse(
        localStorage.getItem("scoreboard_teams") || "[]"
      );

      /* ---------- LOAD ROUND DATA ---------- */
      const round1 = JSON.parse(
        localStorage.getItem("round1_scores") || "[]"
      );

      const round2 = JSON.parse(
        localStorage.getItem("round2_scores") || "[]"
      );

      const round3 = JSON.parse(
        localStorage.getItem("round3_scores") || "[]"
      );

      /* ---------- CALCULATE TOTAL ---------- */
      const result: TeamScore[] = storedTeams.map(
        (team: any, index: number) => {
          const r1 =
            round1.find((r: any) => r.teamName === team.name)?.total || 0;

          const r2 =
            round2.find((r: any) => r.teamName === team.name)?.score || 0;

          const r3 =
            round3.find((r: any) => r.teamName === team.name)?.score || 0;

          return {
            id: index,
            name: team.name,
            score: Number((r1 + r2 + r3).toFixed(2)),
          };
        }
      );

      setTeams(result.sort((a, b) => b.score - a.score));
      setLoading(false);
    };

    loadScores();
  }, []);

  return (
    <div className="team-bg">
      <div className="team-card">
        <h2 className="team-title">SCORE TABLE</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#fff" }}>
            Loading scores...
          </p>
        ) : (
          <div className="score-list">
            {teams.map((team, index) => (
              <div key={team.id} className="score-row">
                <div className={`rank-circle rank-${index + 1}`}>
                  {index + 1}
                </div>
                <span className="team-name">{team.name}</span>
                <span className="team-score">{team.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreboardPage;
