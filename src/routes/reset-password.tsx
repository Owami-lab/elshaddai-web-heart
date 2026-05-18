import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Elshaddai Ministries" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: Reset,
});

function Reset() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api<string>("/api/users/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        raw: true,
      });
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } catch (err: any) {
      setError(err?.message ?? "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-4xl text-primary">Password updated</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl text-primary">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a strong password you haven't used before.
      </p>

      {!token && (
        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          This reset link is missing a token. Please request a new link from the{" "}
          <Link to="/forgot-password" className="underline">
            forgot password
          </Link>{" "}
          page.
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <label className="block text-sm font-medium">New password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
        />

        <label className="mt-4 block text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-6 w-full rounded-md py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--gradient-red)" }}
        >
          {loading ? "Updating…" : "Update password"}
        </button>

        {error && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
