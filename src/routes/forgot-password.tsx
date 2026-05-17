import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Elshaddai Ministries" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "err"; msg?: string }>({
    kind: "idle",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const msg = await api<string>("/api/users/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        raw: true,
      });
      setStatus({ kind: "ok", msg: msg || "If that email exists, a reset link was sent." });
    } catch (err: any) {
      setStatus({ kind: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl text-primary">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send a link to reset your password.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--gradient-red)" }}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {status.kind === "ok" && (
          <p className="mt-4 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-primary">
            {status.msg}
          </p>
        )}
        {status.kind === "err" && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {status.msg}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-gold underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
