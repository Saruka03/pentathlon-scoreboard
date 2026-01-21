import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/WinnerPage.css";
import { supabase } from "../lib/supabase";

type Team = {
  id: string;
  name: string;
  members: string[];
};

const WinnerPage = () => {
  const navigate = useNavigate();

  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [team1Total, setTeam1Total] = useState(0);
  const [team2Total, setTeam2Total] = useState(0);
  const [winner, setWinner] = useState("");

  /* ================= LOAD WINNER FROM DATABASE ================= */

  useEffect(() => {
    loadWinner();
  }, []);

  const loadWinner = async () => {
    // 1️⃣ Get Final round ID
    const { data: finalRound } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", "Final")
      .single();

    if (!finalRound) {
      alert("Final round not found in database");
      return;
    }

    // 2️⃣ Get final scores
    const { data: scores } = await supabase
      .from("scores")
      .select("team_id, points")
      .eq("round_id", finalRound.id);

    if (!scores || scores.length === 0) {
      alert("Final scores not found");
      return;
    }

    // 3️⃣ Sum scores per team
    const totals = new Map<string, number>();

    scores.forEach(s => {
      totals.set(s.team_id, (totals.get(s.team_id) || 0) + s.points);
    });

    // 4️⃣ Get team info
    const teamIds = Array.from(totals.keys());

    const { data: teams } = await supabase
      .from("teams")
      .select("id, name")
      .in("id", teamIds);

    if (!teams || teams.length < 2) {
      alert("Finalist teams missing");
      return;
    }

    // 5️⃣ Sort by score
    const sorted = teams
      .map(t => ({
        ...t,
        total: totals.get(t.id) || 0
      }))
      .sort((a, b) => b.total - a.total);

    const t1 = sorted[0];
    const t2 = sorted[1];

    setTeam1({ id: t1.id, name: t1.name, members: [] });
    setTeam2({ id: t2.id, name: t2.name, members: [] });
    setTeam1Total(t1.total);
    setTeam2Total(t2.total);

    if (t1.total > t2.total) setWinner(t1.name);
    else if (t2.total > t1.total) setWinner(t2.name);
    else setWinner("Draw");
  };

  if (!team1 || !team2) return null;

  return (
    <div className="winner-bg">
      <div className="winner-card">

        <h1 className="winner-title">🎉 Congratulations! 🎉</h1>

        <h2 className="winner-name">
          {winner === "Draw" ? "It's a Draw!" : winner}
        </h2>

        <div className="score-summary">
          <p>{team1.name}: {team1Total} points</p>
          <p>{team2.name}: {team2Total} points</p>
        </div>

        <button
          className="finish-btn"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to Home
        </button>

      </div>
    </div>
  );
};

export default WinnerPage;
