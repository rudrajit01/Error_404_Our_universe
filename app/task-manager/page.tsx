import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TaskManagerDashboard from "@/components/task-manager/TaskManagerDashboard";

export default async function TaskManagerPage() {
  const supabase = await createClient();

  // Verify authentication
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  // Verify approved membership
  const { data: approvedMember, error: approvalError } = await supabase
    .from("approved_members")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (approvalError || !approvedMember) {
    redirect("/home");
  }

  // Verify Task Manager membership and role
  const { data: taskMember, error: taskMemberError } = await supabase
    .from("tm_members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    taskMemberError ||
    !taskMember ||
    !["admin", "member"].includes(taskMember.role)
  ) {
    redirect("/home");
  }

  return (
    <TaskManagerDashboard
      userId={userId}
      role={taskMember.role as "admin" | "member"}
    />
  );
}