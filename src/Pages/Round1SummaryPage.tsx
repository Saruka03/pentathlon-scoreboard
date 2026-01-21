import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/TeamSetupPage.css";
import "../Styles/ScoreboardPage.css";
import { supabase } from "../lib/supabase";

interface TeamSummary {
  id: string;
  name: string;
  score: number;
}

const Round1SummaryPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);

    // 1️⃣ Load teams
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name");

    if (teamsError || !teamsData) {
      alert("Failed to load teams");
      return;
    }

    // 2️⃣ Load scores
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores")
      .select("team_id, points");

    if (scoresError || !scoresData) {
      alert("Failed to load scores");
      return;
    }

    // 3️⃣ Calculate totals
    const result: TeamSummary[] = teamsData.map(team => {
      const teamScores = scoresData.filter(
        s => s.team_id === team.id
      );

      const total = teamScores.reduce(
        (sum, s) => sum + s.points,
        0
      );

      return {
        id: team.id,
        name: team.name,
        score: total
      };
    });

    // 4️⃣ Sort by score
    result.sort((a, b) => b.score - a.score);

    setTeams(result);
    setLoading(false);
  };

  return (
    <div className="team-bg">
      <div className="team-card">
        <h2 className="team-title">ROUND SUMMARY</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#fff" }}>
            Loading summary...
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
