import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/TeamSetupPage.css";

type Team = {
  name: string;
  members: string[];
};

const TOTAL_TEAMS = 5;
const MEMBERS_PER_TEAM = 5;
const STORAGE_KEY = "scoreboard_teams";

const TeamSetupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"teams" | "members">("teams");
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

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

  const saveMembersAndNext = () => {
    const updatedTeams = [...teams];

    updatedTeams[currentTeamIndex].members = members.map(
      (m, i) => m || `Member ${i + 1}`
    );

    setTeams(updatedTeams);
    setMembers(Array(MEMBERS_PER_TEAM).fill(""));

    if (currentTeamIndex < TOTAL_TEAMS - 1) {
      setCurrentTeamIndex(currentTeamIndex + 1);
    } else {
      // ✅ FINAL SAVE TO LOCAL STORAGE
      saveTeamsToLocalStorage(updatedTeams);
      navigate("/scoreboard");
    }
  };

  /* ---------- LOCAL STORAGE ---------- */

  const saveTeamsToLocalStorage = (finalTeams: Team[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalTeams));
    console.log("Teams saved to localStorage:", finalTeams);
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

            <button className="action-btn" onClick={saveMembersAndNext}>
              {currentTeamIndex < TOTAL_TEAMS - 1
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
