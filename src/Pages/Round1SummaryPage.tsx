import { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import "../Styles/Round1SummaryPage.css";
import { supabase } from "../lib/supabase";

interface TeamSummary {
  id: string;
  name: string;
  score: number;
}

const Round1SummaryPage = () => {
  //const navigate = useNavigate();
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
         score: Number((total / 100).toFixed(2))
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
        <h2 className="team-title">KNOCK OUT ROUND</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#fff" }}>
            Loading summary...
          </p>
        ) : (
          <div className="score-list">
            {teams.map((team, index) => (
              <div key={team.id} className={`leader-row rank-${index + 1}`}>
                <div className="avatar">
                  {index + 1}
                </div>
                <div className="leader-content">
                  <span className="leader-name">{team.name}</span>
                  
                </div>
                <div className="leader-score">
                  {team.score}
                </div>
              </div>
            ))}
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Round1SummaryPage;
