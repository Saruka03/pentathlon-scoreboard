import { supabase } from "../lib/supabase";

export const createTeam = async (teamName: string) => {
  return await supabase
    .from("teams")
    .insert({ name: teamName })   // ✅ correct column
    .select()
    .single();
};

export const addTeamMember = async (
  teamId: string,
  memberName: string
) => {
  return await supabase
    .from("players")
    .insert({
      team_id: teamId,
      member_name: memberName
    });
};

export const getAllTeamsWithMembers = async () => {
  return await supabase
    .from("teams")
    .select(`
      id,
      name,
      team_members (
        member_name
      )
    `);
};
