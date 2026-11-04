
import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] p-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/30 bg-white/5 p-8">
        <h1 className="text-2xl font-bold text-cyan-300">
          ERROR 404
        </h1>

        <p className="mt-2 text-gray-400">
          Supabase Connection Test
        </p>

        {error ? (
          <p className="mt-6 text-red-400">
            Connection Error: {error.message}
          </p>
        ) : (
          <div className="mt-6">
            <p className="text-green-400">
              ✓ Supabase connection successful!
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Authentication system is responding.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {data?.claims?.sub
                ? "User session detected."
                : "No user logged in yet."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
