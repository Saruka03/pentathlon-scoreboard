import { useEffect, useState } from "react";
import "../Styles/ScoreboardPage.css";
import { supabase } from "../lib/supabase";

interface TeamScore {
  teamName: string;
  round1: number;
  round2: number;
  total: number;
}

const QualifierSummaryPage = () => {
  const [teams, setTeams] = useState<TeamScore[]>([]);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    // Get round IDs
    const { data: q1 } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", "Qualifier 1")
      .single();

    const { data: q2 } = await supabase
      .from("rounds")
      .select("id")
      .eq("name", "Qualifier 2")
      .single();

    if (!q1 || !q2) {
      alert("Qualifier rounds missing in database");
      return;
    }

    // Get team scores
    const { data: s1 } = await supabase
      .from("scores")
      .select("team_id, points")
      .eq("round_id", q1.id);

    const { data: s2 } = await supabase
      .from("scores")
      .select("team_id, points")
      .eq("round_id", q2.id);

    // Load team names
    const { data: teamRows } = await supabase
      .from("teams")
      .select("id, name");

    const teamMap = new Map<string, TeamScore>();

    // ================= ROUND 1 =================
    s1?.forEach(row => {
      const teamName =
        teamRows?.find(t => t.id === row.team_id)?.name || "Unknown";

      const value = row.points / 100; // ✅ scale back

      const prev = teamMap.get(row.team_id);

      if (!prev) {
        teamMap.set(row.team_id, {
          teamName,
          round1: value,
          round2: 0,
          total: value
        });
      } else {
        prev.round1 += value;
        prev.total += value;
      }
    });

    // ================= ROUND 2 =================
    s2?.forEach(row => {
      const teamName =
        teamRows?.find(t => t.id === row.team_id)?.name || "Unknown";

      const value = row.points / 100; // ✅ scale back

      const prev = teamMap.get(row.team_id);

      if (!prev) {
        teamMap.set(row.team_id, {
          teamName,
          round1: 0,
          round2: value,
          total: value
        });
      } else {
        prev.round2 += value;
        prev.total += value;
      }
    });

    const result = Array.from(teamMap.values()).sort(
      (a, b) => b.total - a.total
    );

    setTeams(result);
  };

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
