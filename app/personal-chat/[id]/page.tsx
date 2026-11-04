
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import friends from "@/data/friends";
import PersonalChat from "@/components/PersonalChat";

interface Props {
  params: Promise<{ id: string }>;
}

const friendAccountMap: Record<string, string> = {
  "friend-01": "Ornab",
  "friend-02": "Joyeta",
  "friend-03": "jeta",
  "friend-04": "Ouindrila Bhowmick",
  "friend-05": "Puja",
  "friend-06": "Shrabontika tunir",
  "friend-07": "Prionti das",
  "friend-08": "Rudrajit",
};

export default async function PersonalConversationPage({
  params,
}: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the currently authenticated user.
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  // Verify that the logged-in user is approved.
  const { data: approvedMember, error: approvalError } = await supabase
    .from("approved_members")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (approvalError || !approvedMember) {
    redirect("/home");
  }

  // Find the selected friend.
  const friend = friends.find((item) => item.id === id);

  if (!friend ) {
    notFound();
  }

  const accountKey = friendAccountMap[id];

  if (!accountKey) {
    notFound();
  }

  // Get the friend's actual Supabase Auth UUID.
  const { data: friendAccount, error: friendError } = await supabase
    .from("friend_accounts")
    .select("user_id")
    .eq("friend_id", accountKey)
    .maybeSingle();

  if (friendError) {
    console.error("FRIEND ACCOUNT ERROR:", friendError);
    throw new Error("Could not load friend account.");
  }

  if (!friendAccount) {
    notFound();
  }

  // Prevent users from opening their own conversation.
  if (friendAccount.user_id === userId) {
    notFound();
  }

  console.log("PERSONAL CHAT IDENTITY:", {
    loggedInUser: userId,
    selectedFriend: accountKey,
    receiverId: friendAccount.user_id,
  });

  return (
    <PersonalChat
      friend={friend}
      senderId={userId}
      receiverId={friendAccount.user_id}
    />
  );
}
