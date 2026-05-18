import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Elshaddai Ministries" }] }),
  component: Forgot,
});

function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api<string>("/api/users/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        raw: true,
      });
      navigate({ to: "/forgot-password/sent", search: { email } });
    } catch (err: any) {
      // Treat any backend response as "sent" to avoid leaking which emails exist.
      navigate({ to: "/forgot-password/sent", search: { email } });
      setError(err?.message ?? null);
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

        {error && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
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
