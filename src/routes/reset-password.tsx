import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { api } from "@/lib/api";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Elshaddai Ministries" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: Reset,
});

function strengthCheck(password: string) {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /\d/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = rules.filter((r) => r.met).length;
  const score = passed === rules.length ? 4 : passed >= 3 ? 3 : passed >= 2 ? 2 : passed >= 1 ? 1 : 0;
  return { rules, passed, score };
}

const meterLabel = ["Weak", "Fair", "Good", "Strong", "Excellent"];
const meterColor = [
  "oklch(0.55 0.22 27)",   // red
  "oklch(0.65 0.18 55)",   // orange
  "oklch(0.7 0.14 80)",    // gold
  "oklch(0.55 0.15 140)",  // green
  "oklch(0.4 0.15 145)",   // dark green
];

function Reset() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { rules, score } = useMemo(() => strengthCheck(password), [password]);
  const confirmMatch = confirm.length > 0 && password === confirm;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    const failed = rules.filter((r) => !r.met);
    if (failed.length > 0) {
      setError(failed[0].label + ".");
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

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="mt-3">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 transition-colors duration-300"
                  style={{
                    backgroundColor: i < score ? meterColor[score - 1] : undefined,
                  }}
                />
              ))}
            </div>
            <p
              className="mt-1 text-right text-xs font-medium"
              style={{ color: meterColor[score > 0 ? score - 1 : 0] }}
            >
              {meterLabel[score]}
            </p>
          </div>
        )}

        <ul className="mt-3 space-y-1">
          {rules.map((r) => (
            <li key={r.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full transition-colors"
                style={{
                  backgroundColor: r.met ? meterColor[3] : "oklch(0.85 0.01 0)",
                }}
                aria-hidden
              />
              {r.met ? <span className="line-through opacity-60">{r.label}</span> : r.label}
            </li>
          ))}
        </ul>

        <label className="mt-5 block text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
        />
        {confirm.length > 0 && (
          <p className={`mt-1.5 text-xs ${confirmMatch ? "text-emerald-600" : "text-destructive"}`}>
            {confirmMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

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
