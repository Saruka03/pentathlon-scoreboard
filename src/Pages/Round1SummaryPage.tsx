import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/TeamSetupPage.css";
import "../Styles/ScoreboardPage.css";

interface TeamSummary {
  id: number;
  name: string;
  score: number;
}

const Round1SummaryPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamSummary[]>([]);

  useEffect(() => {
    fetchRound1Summary();
  }, []);

const fetchRound1Summary = () => {
  const round1 = JSON.parse(
    localStorage.getItem("round1_scores") || "[]"
  );

  const round2 = JSON.parse(
    localStorage.getItem("round2_scores") || "[]"
  );

  const setupTeams = JSON.parse(
    localStorage.getItem("scoreboard_teams") || "[]"
  );

  if (!round1.length || !setupTeams.length) return;

  const formatted: TeamSummary[] = round1.map(
    (r1: any, index: number) => {
      // ✅ FIXED KEY
      const setupTeam = setupTeams.find(
        (t: any) => t.teamName === r1.teamName
      );

      const r2 = round2.find(
        (t: any) => t.teamName === r1.teamName
      );

      return {
        id: index,
        name: setupTeam?.teamName || r1.teamName, // ✅ CORRECT
        score: r1.total + (r2?.score || 0)
      };
    }
  );

  formatted.sort((a, b) => b.score - a.score);

  setTeams(formatted);

  localStorage.setItem(
    "round2Teams",
    JSON.stringify(formatted.slice(0, 3))
  );
};

return (
    <div className="team-bg">
      <div className="team-card">
        <h2 className="team-title">ROUND 1 FINAL SCORES</h2>

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

        {teams.length > 0 && (
          <button
            className="action-btn"
            style={{ marginTop: 40 }}
            onClick={() => navigate("/round2")}
          >
            GO TO QUALIFIER ROUND
          </button>
        )}
      </div>
    </div>
  );
};

export default Round1SummaryPage;
