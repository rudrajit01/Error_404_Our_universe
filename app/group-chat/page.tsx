
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GroupChat from "@/components/GroupChat";


export default async function GroupChatPage() {

  const supabase = await createClient();

  const { data: claims, error } = await supabase.auth.getClaims();

  if (error || !claims?.claims?.sub) {
    redirect("/login");
  }

  const userId = claims.claims.sub as string;

  const { data: approvedMember, error: approvalError } =
    await supabase
      .from("approved_members")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

  if (approvalError || !approvedMember) {
    redirect("/home");
  }

  return <GroupChat />;
}
