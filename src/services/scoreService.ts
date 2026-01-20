import { supabase } from "../lib/supabase";

export const saveTeamRoundScore = async ({
  team_id,
  round_id,
  subject,
  correct_count,
  credit,
  score
}: {
  team_id: string;
  round_id: string;
  subject?: string;
  correct_count?: number;
  credit?: number;
  score: number;
}) => {
  return await supabase
    .from("team_round_scores")
    .insert({
      team_id,
      round_id,
      subject,
      correct_count,
      credit,
      score
    });
};

export const saveRoundTotal = async ({
  team_id,
  round_id,
  score
}: {
  team_id: string;
  round_id: string;
  score: number;
}) => {
  return await supabase
    .from("scores")
    .insert({
      team_id,
      round_id,
      score
    });
};
