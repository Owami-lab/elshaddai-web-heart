import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";

type Search = { email?: string };

export const Route = createFileRoute("/forgot-password/sent")({
  head: () => ({ meta: [{ title: "Check your email — Elshaddai Ministries" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  component: Sent,
});

function Sent() {
  const { email } = Route.useSearch();
  const [resent, setResent] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function resend() {
    if (!email) return;
    setResent("loading");
    setErrMsg(null);
    try {
      await api<string>("/api/users/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        raw: true,
      });
      setResent("done");
    } catch (err: any) {
      setResent("error");
      setErrMsg(err?.message ?? "Could not resend right now.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{ background: "var(--gradient-gold)" }}
        aria-hidden
      >
        ✉️
      </div>
      <h1 className="mt-6 font-display text-4xl text-primary">Check your email</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        If an account exists for{" "}
        <span className="font-semibold text-foreground">{email || "that address"}</span>, we've
        sent a password reset link. It may take a minute to arrive — check your spam folder if you
        don't see it.
      </p>

      <div
        className="mt-8 rounded-2xl border border-border bg-card p-6 text-left"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <h2 className="font-display text-lg text-primary">What's next</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Open the email from Elshaddai Ministries.</li>
          <li>Click the reset link — it expires soon for your security.</li>
          <li>Choose a new password and sign back in.</li>
        </ol>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={resend}
          disabled={!email || resent === "loading"}
          className="text-sm font-semibold text-gold underline disabled:opacity-50"
        >
          {resent === "loading" ? "Resending…" : "Resend the email"}
        </button>
        {resent === "done" && (
          <p className="text-xs text-muted-foreground">A new link is on its way.</p>
        )}
        {resent === "error" && (
          <p className="text-xs text-destructive">{errMsg}</p>
        )}

        <Link
          to="/login"
          className="mt-2 inline-block rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--gradient-red)" }}
        >
          Back to sign in
        </Link>
        <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
          Use a different email
        </Link>
      </div>
    </div>
  );
}
