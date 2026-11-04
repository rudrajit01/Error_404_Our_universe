
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface PersonalChatProps {
  friend: {
    id: string;
    name: string;
    nickname: string;
  };
  senderId: string;
  receiverId: string;
}

interface PersonalMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  media_url: string | null;
  media_type: "image" | "audio" | null;
  created_at: string;
}

const emojis = [
  "😀", "😂", "😍", "🥰", "❤️", "🔥",
  "👍", "😭", "🤣", "🎉", "🤝", "💯",
];

export default function PersonalChat({
  friend,
  senderId,
  receiverId,
}: PersonalChatProps) {
  const supabase = useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<PersonalMessage[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [authenticatedUserId, setAuthenticatedUserId] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Prevent duplicate messages.
  const addMessage = useCallback((newMessage: PersonalMessage) => {
    setMessages((current) => {
      if (current.some((item) => item.id === newMessage.id)) {
        return current;
      }

      return [...current, newMessage].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    });
  }, []);

  // Verify the logged-in user, load messages and subscribe to realtime.
  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function initializeChat() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          setError("Please log in to use personal chat.");
          setLoading(false);
          return;
        }

        // The actual logged-in account must be the sender.
        if (user.id !== senderId) {
          console.error("CHAT USER ID MISMATCH:", {
            loggedInUserId: user.id,
            senderId,
            receiverId,
          });

          setError(
            "Your login account does not match this chat session. Please log out and log in again."
          );
          setLoading(false);
          return;
        }

        if (!receiverId || receiverId === user.id) {
          setError("Invalid conversation recipient.");
          setLoading(false);
          return;
        }

        setAuthenticatedUserId(user.id);

        console.log("CHAT IDENTITY VERIFIED:", {
          senderId: user.id,
          receiverId,
          friend: friend.name,
        });

        // Fetch messages sent in either direction.
        const { data, error: fetchError } = await supabase
          .from("personal_messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });

        if (!active) return;

        console.log("MESSAGE FETCH DEBUG:", {
          senderId: user.id,
          receiverId,
          data,
          fetchError,
        });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setMessages((data || []) as PersonalMessage[]);
        }

        // Listen for messages from both participants.
        channel = supabase
          .channel(`personal-chat-${user.id}-${receiverId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "personal_messages",
            },
            (payload) => {
              const newMessage = payload.new as PersonalMessage;

              const belongsToConversation =
                (newMessage.sender_id === user.id &&
                  newMessage.receiver_id === receiverId) ||
                (newMessage.sender_id === receiverId &&
                  newMessage.receiver_id === user.id);

              if (belongsToConversation) {
                addMessage(newMessage);
              }
            }
          )
          .subscribe((status, subscriptionError) => {
            console.log("CHAT REALTIME STATUS:", {
              status,
              subscriptionError,
            });
          });
      } catch (err) {
        console.error("CHAT INITIALIZATION ERROR:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to initialize chat."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initializeChat();

    return () => {
      active = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [
    senderId,
    receiverId,
    friend.name,
    supabase,
    addMessage,
  ]);

  // Scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up recording timer and media previews.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || sending) return;

    if (photoUrl || audioUrl) {
      alert(
        "Text messaging is enabled first. Photo and voice sending will be added next."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      // Never trust a sender ID that differs from the actual session.
      if (user.id !== senderId || user.id !== authenticatedUserId) {
        setError("Login identity mismatch. Please log in again.");
        return;
      }

      console.log("MESSAGE INSERT DEBUG:", {
        senderId: user.id,
        receiverId,
        currentUserId: user.id,
      });

      const { data, error: insertError } = await supabase
        .from("personal_messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          message: text,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("MESSAGE INSERT ERROR:", insertError);
        setError(insertError.message);
        return;
      }

      if (data) {
        addMessage(data as PersonalMessage);
        setMessage("");
        setShowEmojis(false);
      }
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        !window.MediaRecorder
      ) {
        alert("Voice recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((value) => value + 1);
      }, 1000);
    } catch {
      alert("Microphone permission is required.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecording(false);
  }

  function selectPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Photo must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setPhotoUrl(URL.createObjectURL(file));
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function removePhoto() {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      setPhotoUrl("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAudio() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] p-4 text-white sm:p-8">
      <div className="mx-auto flex min-h-[85vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0b1224] shadow-[0_0_40px_rgba(34,211,238,0.08)]">

        {/* Header */}
        <header className="flex items-center gap-4 border-b border-white/10 p-5">
          <a
            href="/personal-chat"
            className="text-xl text-cyan-400 hover:text-white"
          >
            ←
          </a>

          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-[#17233d] text-xl">
            👤
          </div>

          <div className="flex-1">
            <h1 className="font-bold tracking-wider">
              {friend.name}
            </h1>
            <p className="text-xs text-cyan-400">
              {friend.nickname}
            </p>
          </div>

          <span className="text-xs text-cyan-400">
            PRIVATE CHAT
          </span>
        </header>

        {/* Messages */}
        <section className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <p className="text-center font-mono text-[10px] tracking-widest text-gray-500">
            YOUR PRIVATE CONVERSATION
          </p>

          {loading && (
            <p className="py-8 text-center text-sm text-gray-400">
              Loading messages...
            </p>
          )}

          {!loading && messages.length === 0 && !error && (
            <p className="py-8 text-center text-sm text-gray-500">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((item) => {
            const isMine = item.sender_id === authenticatedUserId;

            return (
              <div
                key={item.id}
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMine
                    ? "self-end rounded-br-sm border border-cyan-400/20 bg-cyan-500/10"
                    : "self-start rounded-bl-sm border border-white/10 bg-[#17233d]"
                }`}
              >
                {item.message && (
                  <p className="whitespace-pre-wrap wrap-break-words text-sm">
                    {item.message}
                  </p>
                )}

                {item.media_url && item.media_type === "image" && (
                  <img
                    src={item.media_url}
                    alt="Shared"
                    className="max-h-64 rounded-lg object-contain"
                  />
                )}

                {item.media_url && item.media_type === "audio" && (
                  <audio controls src={item.media_url} />
                )}

                <span className="mt-2 block text-right text-[10px] text-gray-500">
                  {formatTime(item.created_at)}
                </span>
              </div>
            );
          })}

          {error && (
            <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}

          {photoUrl && (
            <div className="max-w-[75%] self-end rounded-xl border border-cyan-400/30 p-2">
              <img
                src={photoUrl}
                alt="Selected preview"
                className="max-h-56 rounded-lg object-contain"
              />

              <button
                onClick={removePhoto}
                className="mt-2 text-xs text-red-400"
              >
                Remove photo
              </button>
            </div>
          )}

          {audioUrl && (
            <div className="max-w-[85%] self-end rounded-xl border border-purple-400/30 bg-purple-500/10 p-3">
              <audio controls src={audioUrl} className="max-w-full" />

              <button
                onClick={removeAudio}
                className="mt-2 block text-xs text-red-400"
              >
                Remove voice message
              </button>
            </div>
          )}

          {recording && (
            <p className="self-end text-sm text-red-400">
              ● Recording... {seconds}s
            </p>
          )}

          <div ref={bottomRef} />
        </section>

        {/* Composer */}
        <div className="relative border-t border-white/10 p-4">
          {showEmojis && (
            <div className="mb-3 grid grid-cols-6 gap-2 rounded-xl border border-white/10 bg-[#17233d] p-3">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    setMessage((value) => value + emoji)
                  }
                  className="rounded-lg p-2 text-xl hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojis((value) => !value)}
              className="rounded-lg p-3 text-xl text-yellow-300 hover:bg-white/10"
              aria-label="Choose emoji"
            >
              ☺
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-3 text-xl text-cyan-300 hover:bg-white/10"
              aria-label="Attach photo"
            >
              📷
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={selectPhoto}
            />

            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-gray-500 focus:border-cyan-400/50"
            />

            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`rounded-lg p-3 text-xl hover:bg-white/10 ${
                recording ? "text-red-400" : "text-purple-300"
              }`}
              aria-label={
                recording ? "Stop recording" : "Record voice message"
              }
            >
              {recording ? "■" : "🎙️"}
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={!message.trim() || sending || !authenticatedUserId}
              className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-gray-500">
            Supabase · Realtime messaging
          </p>
        </div>
      </div>
    </main>
  );
}
