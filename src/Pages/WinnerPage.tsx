import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/WinnerPage.css";

type Team = {
  id: number;
  name: string;
  members: string[];
};

const WinnerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [team1Total, setTeam1Total] = useState(0);
  const [team2Total, setTeam2Total] = useState(0);
  const [winner, setWinner] = useState("");

  /* ================= LOAD WINNER ================= */

  useEffect(() => {
    // 1️⃣ Try router state first
    if (location.state) {
      const {
        team1,
        team2,
        team1Total,
        team2Total,
        winner,
      }: any = location.state;

      setTeam1(team1);
      setTeam2(team2);
      setTeam1Total(team1Total);
      setTeam2Total(team2Total);
      setWinner(winner);
      return;
    }

    // 2️⃣ Fallback to localStorage (refresh-safe)
    const raw = localStorage.getItem("round4Results");
    if (!raw) return;

    const data = JSON.parse(raw);

    setTeam1(data.team1);
    setTeam2(data.team2);
    setTeam1Total(data.team1Total);
    setTeam2Total(data.team2Total);

    if (data.team1Total > data.team2Total) {
      setWinner(data.team1.name);
    } else if (data.team2Total > data.team1Total) {
      setWinner(data.team2.name);
    } else {
      setWinner("Draw");
    }
  }, [location.state]);

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
            localStorage.clear(); // optional: reset scoreboard
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
