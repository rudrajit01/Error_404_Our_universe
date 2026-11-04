
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import friends from "@/data/friends";
import { createClient } from "@/lib/supabase/client";

const demoMessages = [
  "Hey! What's going on? 👋",
  "See you soon!",
  "Let's plan something.",
  "That was an amazing day!",
  "Send me the photos.",
  "Are you online?",
  "We need to catch up!",
  "Good memories forever ❤️",
];

// Connect local friend IDs with friend_accounts.friend_id values.
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

export default function PersonalChatDashboard() {
  const [search, setSearch] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [friendUserIds, setFriendUserIds] = useState<Record<string, string>>(
    {}
  );

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const setupPresence = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (cancelled || authError || !authData.user) return;

      const currentUserId = authData.user.id;

      // Load the Supabase account ID for every friend.
      const { data: accounts, error: accountsError } = await supabase
        .from("friend_accounts")
        .select("friend_id, user_id");

      if (cancelled) return;

      if (accountsError) {
        console.error("Could not load friend accounts:", accountsError);
        return;
      }

      const accountMap: Record<string, string> = {};

      for (const friend of friends) {
        const accountName = friendAccountMap[friend.id];

        const account = accounts?.find(
          (item) => item.friend_id === accountName
        );

        if (account?.user_id) {
          accountMap[friend.id] = account.user_id;
        }
      }

      setFriendUserIds(accountMap);

      // All approved members must use this same channel name.
      channel = supabase.channel("online-members", {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          if (cancelled || !channel) return;

          const presenceState = channel.presenceState();

          const activeIds = Object.values(presenceState)
            .flatMap((presences) =>
              presences.map(
                (presence) =>
                  (presence as { user_id?: string }).user_id
              )
            )
            .filter((id): id is string => Boolean(id));

          setOnlineUserIds(new Set(activeIds));
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && !cancelled) {
            await channel?.track({
              user_id: currentUserId,
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) => {
      const name = friend.name || "";
      const nickname = friend.nickname || "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        nickname.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search]);

  return (
    <main className="min-h-screen bg-[#030712] px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.35em] text-cyan-400">
              ERROR 404 / PRIVATE SPACE
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-wide sm:text-4xl">
              Personal <span className="text-cyan-400">Messages</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Your circle. Your conversations. Your universe.
            </p>
          </div>

          <Link
            href="/private-space"
            className="rounded-lg border border-cyan-400/30 px-5 py-3 font-mono text-xs text-cyan-300 transition hover:bg-cyan-400/10"
          >
            ← BACK
          </Link>
        </header>

        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your friends..."
            className="w-full rounded-xl border border-cyan-400/20 bg-[#0b1224] px-5 py-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400/60"
          />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-mono text-sm tracking-widest text-gray-300">
            YOUR FRIENDS
          </h2>

          <span className="text-xs text-cyan-400">
            {filteredFriends.length} MEMBERS
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFriends.map((friend, index) => {
            const photo = friend.profile?.photo;
            const userId = friendUserIds[friend.id];
            const isOnline = Boolean(
              userId && onlineUserIds.has(userId)
            );

            return (
              <Link
                key={friend.id}
                href={`/personal-chat/${friend.id}`}
                className="group rounded-2xl border border-white/10 bg-[#0b1224]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-[#101b32]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={`${friend.name} profile photo`}
                        fill
                        sizes="64px"
                        className="rounded-full border-2 border-cyan-400/40 bg-[#17233d] object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-[#17233d] text-2xl">
                        👤
                      </div>
                    )}

                    <span
                      className={`absolute bottom-0 right-0 z-10 h-4 w-4 rounded-full border-2 border-[#0b1224] ${
                        isOnline ? "bg-green-400" : "bg-gray-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold tracking-wide text-white">
                      {friend.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-gray-400">
                      {friend.nickname}
                    </p>

                    <p
                      className={`mt-2 text-[10px] font-mono tracking-wider ${
                        isOnline ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {isOnline ? "● ONLINE" : "● OFFLINE"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="truncate text-xs text-gray-400">
                    {demoMessages[index % demoMessages.length]}
                  </p>

                  <p className="mt-3 text-right text-[10px] tracking-widest text-cyan-400 opacity-70 transition group-hover:opacity-100">
                    OPEN CHAT ↗
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredFriends.length === 0 && (
          <div className="rounded-xl border border-white/10 py-16 text-center">
            <p className="text-gray-400">No friends found.</p>
          </div>
        )}

        <footer className="mt-16 text-center font-mono text-[10px] tracking-[0.3em] text-gray-600">
          ERROR 404 © 2026 — OUR LITTLE UNIVERSE
        </footer>
      </div>
    </main>
  );
}
