
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  user_id: string;
  message: string;
  media_url: string | null;
  media_type: "image" | "audio" | null;
  created_at: string;
  signed_url?: string;
}

const EMOJIS = [
  "😀", "😂", "😍", "🥰", "❤️", "🔥",
  "👍", "😭", "🤣", "🎉", "🤝", "💯",
  "😎", "🥳", "✨", "👽", "🌌", "💜",
];

export default function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  async function prepareMessage(message: Message): Promise<Message> {
    if (!message.media_url) return message;

    const { data, error } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(message.media_url, 3600);

    if (error) {
      console.error("Media URL error:", error.message);
      return message;
    }

    return { ...message, signed_url: data.signedUrl };
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let active = true;

    async function loadChat() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        setError("Please log in to access the group chat.");
        setLoading(false);
        return;
      }

      setUserId(authData.user.id);

      const { data, error: fetchError } = await supabase
        .from("group_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const prepared = await Promise.all(
        (data ?? []).map((item) => prepareMessage(item as Message))
      );

      if (!active) return;

      setMessages(prepared);
      setLoading(false);

      channel = supabase
        .channel("group-chat-room")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "group_messages",
          },
          async (payload) => {
            const newMessage = await prepareMessage(
              payload.new as Message
            );

            if (!active) return;

            setMessages((previous) =>
              previous.some((item) => item.id === newMessage.id)
                ? previous
                : [...previous, newMessage]
            );
          }
        )
        .subscribe();
    }

    loadChat();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendToDatabase(
    messageText: string,
    mediaPath: string | null = null,
    mediaType: "image" | "audio" | null = null
  ) {
    if (!userId) return;

    const { data, error: sendError } = await supabase
      .from("group_messages")
      .insert({
        user_id: userId,
        message: messageText,
        media_url: mediaPath,
        media_type: mediaType,
      })
      .select()
      .single();

    if (sendError) throw sendError;

    if (data) {
      const prepared = await prepareMessage(data as Message);

      setMessages((previous) =>
        previous.some((item) => item.id === prepared.id)
          ? previous
          : [...previous, prepared]
      );
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const messageText = text.trim();
    if (!messageText || !userId || sending) return;

    setSending(true);
    setError("");

    try {
      await sendToDatabase(messageText);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message failed.");
    } finally {
      setSending(false);
    }
  }

  async function uploadMedia(file: File, type: "image" | "audio") {
    if (!userId || sending) return;

    const maxSize = type === "image" ? 10 * 1024 * 1024 : 20 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        type === "image"
          ? "Image must be under 10 MB."
          : "Voice message must be under 20 MB."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const extension = type === "image" ? "jpg" : "webm";
      const path = `group/${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      await sendToDatabase(
        type === "image" ? "📷 Photo" : "🎙️ Voice message",
        path,
        type
      );

      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSending(false);
    }
  }

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    await uploadMedia(file, "image");
    event.target.value = "";
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const audioBlob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size > 0) {
          const audioFile = new File(
            [audioBlob],
            `voice-${Date.now()}.webm`,
            { type: audioBlob.type }
          );

          await uploadMedia(audioFile, "audio");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setError("");
    } catch {
      setError("Microphone permission is required for voice messages.");
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/private-space"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← BACK TO PRIVATE SPACE
        </Link>

        <header className="my-8 border-b border-cyan-500/20 pb-6">
          <p className="font-mono text-xs tracking-[0.3em] text-cyan-500">
            ERROR 404 // PRIVATE NETWORK
          </p>

          <h1 className="mt-3 text-3xl font-bold text-cyan-300">
            GROUP CHAT 🌌
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            One room. Eight friends. Endless memories.
          </p>
        </header>

        <section className="flex h-[65vh] flex-col rounded-2xl border border-cyan-500/20 bg-[#081321] p-4">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {loading && (
              <p className="text-center text-gray-400">
                Loading messages...
              </p>
            )}

            {!loading && messages.length === 0 && (
              <p className="py-12 text-center text-gray-500">
                No messages yet. Start the conversation! ✨
              </p>
            )}

            {messages.map((item) => {
              const mine = item.user_id === userId;

              return (
                <div
                  key={item.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
                      mine
                        ? "border-cyan-500/30 bg-cyan-700/30"
                        : "border-purple-500/20 bg-purple-900/30"
                    }`}
                  >
                    <p className="mb-1 text-[10px] text-gray-400">
                      {mine ? "YOU" : `MEMBER ${item.user_id.slice(0, 8)}`}
                    </p>

                    {item.media_type === "image" && item.signed_url && (
                      <a href={item.signed_url} target="_blank" rel="noreferrer">
                        <img
                          src={item.signed_url}
                          alt="Shared photo"
                          className="mb-2 max-h-64 rounded-xl object-cover"
                        />
                      </a>
                    )}

                    {item.media_type === "audio" && item.signed_url && (
                      <audio
                        controls
                        src={item.signed_url}
                        className="mb-2 max-w-full"
                      />
                    )}

                    {item.message && (
                      <p className="wrap-break-word text-sm">
                        {item.message}
                      </p>
                    )}

                    <p className="mt-2 text-right text-[10px] text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {preview && (
            <div className="my-2 flex items-center gap-3">
              <img
                src={preview}
                alt="Selected photo preview"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <span className="text-xs text-gray-400">
                Photo uploaded or being prepared...
              </span>
            </div>
          )}

          {showEmojis && (
            <div className="my-2 flex flex-wrap gap-2 rounded-xl border border-cyan-500/20 bg-black/40 p-3">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setText((previous) => previous + emoji)}
                  className="rounded-lg p-1 text-xl hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowEmojis((previous) => !previous)}
              className="rounded-xl border border-cyan-500/30 px-3 py-3 hover:bg-cyan-500/10"
              title="Emoji"
            >
              😀
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="rounded-xl border border-cyan-500/30 px-3 py-3 hover:bg-cyan-500/10 disabled:opacity-40"
              title="Send photo"
            >
              📷
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />

            <button
              type="button"
              onClick={toggleRecording}
              disabled={sending}
              className={`rounded-xl border px-3 py-3 disabled:opacity-40 ${
                recording
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : "border-cyan-500/30 hover:bg-cyan-500/10"
              }`}
              title={recording ? "Stop recording" : "Record voice"}
            >
              {recording ? "⏹️" : "🎙️"}
            </button>

            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write your message..."
              maxLength={2000}
              className="min-w-0 flex-1 rounded-xl border border-cyan-500/20 bg-black/40 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={sending || !text.trim() || !userId}
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:opacity-40"
            >
              {sending ? "..." : "SEND"}
            </button>
          </form>

          {recording && (
            <p className="mt-2 text-xs text-red-400">
              ● Recording... Press stop when finished.
            </p>
          )}

          {error && (
            <p className="mt-3 wrap-break-word text-xs text-red-400">
              {error}
            </p>
          )}
        </section>

        <p className="mt-5 text-center font-mono text-[10px] tracking-widest text-gray-600">
          PRIVATE GROUP // ERROR 404 © 2026
        </p>
      </div>
    </main>
  );
}
