import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/verify-sent")({
  head: () => ({ meta: [{ title: "Verify your email — Elshaddai Ministries" }] }),
  component: VerifySent,
});

function VerifySent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams("");
  const email = qs.get("email") || "";

  async function resend() {
    setLoading(true);
    setMsg(null);
    try {
      await api("/api/users/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
        raw: true,
      });
      setMsg("Verification email resent. Check your inbox.");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col px-6 py-20">
      <h1 className="font-display text-3xl text-primary">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification email to <strong>{email}</strong>. Click the link in that email to verify your
        address before signing in.
      </p>

      {msg && (
        <p className="mt-4 rounded-md border border-muted/30 bg-muted/5 p-3 text-sm">{msg}</p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={resend}
          disabled={loading || !email}
          className="rounded-md py-2 px-4 font-semibold text-primary"
          style={{ background: "var(--gradient-gold)" }}
        >
          {loading ? "Resending…" : "Resend verification"}
        </button>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="rounded-md py-2 px-4 font-semibold text-primary border border-input"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
