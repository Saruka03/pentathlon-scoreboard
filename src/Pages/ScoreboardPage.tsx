import { useEffect, useState } from "react";
import "../Styles/ScoreboardPage.css";
import { supabase } from "../lib/supabase";

interface TeamScore {
  id: string;
  name: string;
  score: number;
}

const ScoreboardPage = () => {
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
    const interval = setInterval(loadScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadScores = async () => {
    setLoading(true);

    const { data: teamsData } = await supabase.from("teams").select("id, name");
    const { data: scoresData } = await supabase.from("scores").select("team_id, points");

    if (!teamsData || !scoresData) {
      setLoading(false);
      return;
    }

    const result: TeamScore[] = teamsData.map(team => {
      const total = scoresData
        .filter(s => s.team_id === team.id)
        .reduce((sum, s) => sum + s.points, 0);

      return { id: team.id, name: team.name, score: total };
    });

    result.sort((a, b) => b.score - a.score);
    setTeams(result);
    setLoading(false);
  };

  return (
  <div className="score-bg">
    <div className="score-overlay">
      <div className="score-container">

        <h1 className="score-title">Score Board</h1>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <div className="glass-scoreboard">
          <div className="timeline">
            {teams.map((team, index) => (
              <div key={team.id} className={`timeline-row color-${index + 1}`}>
                
                <div className="round-circle">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="timeline-content">
                  <div className="team-name">{team.name}</div>
                  <div className="team-score">{team.score} points</div>
                </div>

              </div>
            ))}
          </div>
          </div>
        )}

      </div>
    </div>
  </div>
);

};

export default ScoreboardPage;
