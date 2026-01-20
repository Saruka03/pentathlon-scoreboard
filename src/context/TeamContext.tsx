import { createContext, useContext, useState } from "react";

type TeamContextType = {
  teams: string[];
  setTeams: (teams: string[]) => void;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<string[]>([]);

  return (
    <TeamContext.Provider value={{ teams, setTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeams must be used inside TeamProvider");
  return context;
};
