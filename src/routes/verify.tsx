import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Email verification — Elshaddai Ministries" }] }),
  component: Verify,
});

function Verify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const qs = new URLSearchParams(window.location.search);
      const token = qs.get("token") || qs.get("t") || "";
      if (!token) {
        setStatus("No verification token provided.");
        return;
      }
      try {
        await api("/api/users/verify", {
          method: "POST",
          body: JSON.stringify({ token }),
          raw: true,
        });
        setStatus("Email verified! You can now sign in.");
      } catch (err: unknown) {
        setStatus(err instanceof Error ? err.message : String(err));
      }
    }
    run();
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col px-6 py-20">
      <h1 className="font-display text-3xl text-primary">Email verification</h1>
      <p className="mt-4 text-sm text-muted-foreground">{status ?? "Verifying…"}</p>
      <div className="mt-6">
        <Link to="/login" className="font-semibold text-gold">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
