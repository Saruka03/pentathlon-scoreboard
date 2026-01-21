import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/TeamSetupPage.css";
import { supabase } from "../lib/supabase";

type Team = {
  name: string;
  members: string[];
};

const TOTAL_TEAMS = 5;
const MEMBERS_PER_TEAM = 5;

const TeamSetupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"teams" | "members">("teams");
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const [teamNames, setTeamNames] = useState<string[]>(
    Array(TOTAL_TEAMS).fill("")
  );

  const [members, setMembers] = useState<string[]>(
    Array(MEMBERS_PER_TEAM).fill("")
  );

  const [teams, setTeams] = useState<Team[]>([]);

  /* ---------- TEAM NAME STEP ---------- */

  const handleTeamNameChange = (index: number, value: string) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const goToMembersStep = () => {
    const initializedTeams: Team[] = teamNames.map((name, index) => ({
      name: name || `Team ${index + 1}`,
      members: []
    }));

    setTeams(initializedTeams);
    setStep("members");
  };

  /* ---------- MEMBERS STEP ---------- */

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const saveMembersAndNext = async () => {
    const updatedTeams = [...teams];

    updatedTeams[currentTeamIndex].members = members.map(
      (m, i) => m || `Member ${i + 1}`
    );

    setTeams(updatedTeams);
    setMembers(Array(MEMBERS_PER_TEAM).fill(""));

    if (currentTeamIndex < TOTAL_TEAMS - 1) {
      setCurrentTeamIndex(currentTeamIndex + 1);
    } else {
      // ✅ FINAL SAVE TO SUPABASE
      await saveTeamsToSupabase(updatedTeams);
    }
  };

  /* ---------- SUPABASE SAVE ---------- */

  const saveTeamsToSupabase = async (finalTeams: Team[]) => {
    try {
      setSaving(true);

      // Optional: clear old data
      await supabase.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      for (const team of finalTeams) {
        // 1️⃣ Insert team
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .insert([{ name: team.name }])
          .select()
          .single();

        if (teamError) throw teamError;

        // 2️⃣ Insert members
        const membersPayload = team.members.map((memberName) => ({
          team_id: teamData.id,
          name: memberName
        }));

        const { error: membersError } = await supabase
          .from("players")
          .insert(membersPayload);

        if (membersError) throw membersError;
      }

      alert("✅ Teams saved to database successfully!");
      navigate("/scoreboard");

    } catch (err) {
      console.error("❌ Supabase save error:", err);
      alert("Failed to save teams. Check console.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="team-bg">
      <div className="team-card">

        {/* STEP 1 – TEAM NAMES */}
        {step === "teams" && (
          <>
            <h1 className="team-title">ENTER TEAM NAMES</h1>

            <div className="team-inputs">
              {teamNames.map((team, index) => (
                <input
                  key={index}
                  className="team-input"
                  placeholder={`Team ${index + 1}`}
                  value={team}
                  onChange={(e) =>
                    handleTeamNameChange(index, e.target.value)
                  }
                />
              ))}
            </div>

            <button className="action-btn" onClick={goToMembersStep}>
              NEXT
            </button>
          </>
        )}

        {/* STEP 2 – TEAM MEMBERS */}
        {step === "members" && (
          <>
            <h1 className="team-title">
              {teams[currentTeamIndex]?.name}
            </h1>

            <p className="subtitle">Enter Team Members</p>

            <div className="team-inputs">
              {members.map((member, index) => (
                <input
                  key={index}
                  className="team-input"
                  placeholder={`Member ${index + 1}`}
                  value={member}
                  onChange={(e) =>
                    handleMemberChange(index, e.target.value)
                  }
                />
              ))}
            </div>

            <button className="action-btn" onClick={saveMembersAndNext} disabled={saving}>
              {saving
                ? "SAVING..."
                : currentTeamIndex < TOTAL_TEAMS - 1
                ? "NEXT TEAM"
                : "FINISH"}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default TeamSetupPage;
