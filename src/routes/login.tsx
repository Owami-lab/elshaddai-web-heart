import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Elshaddai Ministries" }] }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usernameOrEmail, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate({ to: "/" });
    } catch (e: unknown) {
      let msg = e instanceof Error ? e.message : "Login failed";
      try {
        const parsed = JSON.parse(msg);
        if (parsed && parsed.message) msg = parsed.message;
      } catch {
        // not JSON
      }
      setErr(msg);
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("verified") || msg.toLowerCase().includes("not verified")) {
        setUnverifiedEmail(usernameOrEmail);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-4xl text-primary">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to your account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Username or Email</label>
          <input
            value={usernameOrEmail}
            onChange={(e) => setU(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2.5 focus:border-gold focus:outline-none"
          />
        </div>
        {err && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {err}
          </p>
        )}
        {unverifiedEmail && (
          <div className="mt-3 rounded-md border border-muted/30 bg-muted/5 p-3 text-sm">
            Your account is not verified. <a href={`/verify-sent?email=${encodeURIComponent(unverifiedEmail)}`} className="font-semibold text-gold">Resend verification</a>
          </div>
        )}
        <button
          disabled={loading}
          className="w-full rounded-md py-3 font-semibold text-primary shadow-gold transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-gold">
          Create an account
        </Link>
      </p>
    </div>
  );
}
