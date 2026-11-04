
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PersonalChatDashboard from "@/components/PersonalChatDashboard";

export default async function PersonalChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  const { data: approvedMember, error: approvalError } =
    await supabase
      .from("approved_members")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
  console.log("PERSONAL CHAT ACCESS DEBUG:", {
   authUserId: userId,
   approvedMember,
   approvalError,
 }); 

  if (approvalError || !approvedMember) {
    redirect("/home");
  }

  return <PersonalChatDashboard />;
}
