import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/giving")({
  head: () => ({
    meta: [
      { title: "Giving — Elshaddai Ministries" },
      { name: "description", content: "Support the work of the ministry with your tithes and offerings." },
    ],
  }),
  component: Giving,
});

function Giving() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState("Card");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "err"; msg?: string }>({
    kind: "idle",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setStatus({ kind: "idle" });
    try {
      const msg = await api<string>("/api/giving", {
        method: "POST",
        auth: true,
        raw: true,
        body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method }),
      });
      setStatus({ kind: "ok", msg });
    } catch (err: any) {
      setStatus({ kind: "err", msg: err.message });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold">Tithes & Offerings</span>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Give Generously</h1>
        <p className="mt-6 text-muted-foreground">
          "Each one must give as he has decided in his heart, not reluctantly or under
          compulsion, for God loves a cheerful giver."
        </p>
        <p className="mt-2 text-sm font-medium text-gold">— 2 Corinthians 9:7</p>

        <div className="mt-10 rounded-xl bg-primary p-8 text-primary-foreground">
          <h3 className="font-display text-xl text-gold">Other ways to give</h3>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Bank: ABSA · Acc: 1234 5678 · Branch: 632 005<br />
            Reference: Tithe / Offering / Building Fund
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <h2 className="font-display text-2xl text-primary">Give Online</h2>
        {!user && (
          <p className="mt-2 text-sm text-muted-foreground">
            You need to{" "}
            <Link to="/login" className="font-semibold text-gold underline">
              sign in
            </Link>{" "}
            to record a gift.
          </p>
        )}

        <label className="mt-6 block text-sm font-medium text-foreground">Amount (ZAR)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-lg text-foreground focus:border-gold focus:outline-none"
          required
        />

        <label className="mt-6 block text-sm font-medium text-foreground">Payment Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-foreground focus:border-gold focus:outline-none"
        >
          <option>Card</option>
          <option>EFT</option>
          <option>Cash</option>
          <option>SnapScan</option>
        </select>

        <button
          type="submit"
          className="mt-8 w-full rounded-md py-3 font-semibold text-primary shadow-gold transition hover:opacity-90"
          style={{ background: "var(--gradient-gold)" }}
        >
          {user ? "Give Now" : "Sign in to Give"}
        </button>

        {status.kind === "ok" && (
          <p className="mt-4 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-primary">
            {status.msg || "Thank you for your generosity."}
          </p>
        )}
        {status.kind === "err" && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {status.msg}
          </p>
        )}
      </form>
    </div>
  );
}
