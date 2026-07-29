import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/giving")({
  head: () => ({
    meta: [
      { title: "Giving — Elshaddai Ministries" },
      {
        name: "description",
        content: "Support the work of the ministry with your tithes and offerings.",
      },
    ],
  }),
  component: Giving,
});

function Giving() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState("EFT");
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "err"; msg?: string }>({
    kind: "idle",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim() || "owamisiganga@gmail.com";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setStatus({ kind: "idle" });

    if (method === "EFT" && !proofFile) {
      setStatus({
        kind: "err",
        msg: "Please upload a proof of payment slip for EFT donations.",
      });
      return;
    }

    try {
      let msg: string;
      if (method === "EFT") {
        const uploadFile = proofFile;
        if (!uploadFile) {
          throw new Error("Please upload a proof of payment slip for EFT donations.");
        }

        const formData = new FormData();
        formData.append("amount", String(parseFloat(amount)));
        formData.append("paymentMethod", method);
        formData.append("method", method);
        formData.append("reference", reference.trim());
        if (adminEmail) {
          formData.append("adminEmail", adminEmail);
        }
        formData.append("proof", uploadFile, uploadFile.name);

        msg = await api<string>("/api/giving", {
          method: "POST",
          auth: true,
          raw: true,
          body: formData,
        });
      } else {
        msg = await api<string>("/api/giving", {
          method: "POST",
          auth: true,
          raw: true,
          body: JSON.stringify({
            amount: parseFloat(amount),
            paymentMethod: method,
            reference: reference.trim(),
          }),
        });
      }
      setStatus({ kind: "ok", msg: "Thank you, may the Lord bless you." });
      setShowSuccess(true);
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "err", msg: message });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold">Tithes & Offerings</span>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Give Generously</h1>
        <p className="mt-6 text-muted-foreground">
          "Each one must give as he has decided in his heart, not reluctantly or under compulsion,
          for God loves a cheerful giver."
        </p>
        <p className="mt-2 text-sm font-medium text-gold">— 2 Corinthians 9:7</p>

        <div className="mt-10 rounded-xl bg-primary p-8 text-primary-foreground">
          <h3 className="font-display text-xl text-gold">Other ways to give</h3>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Bank: ABSA · Acc: 1234 5678 · Branch: 632 005
            <br />
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
          <option>EFT</option>
          <option>Cash</option>
          <option>SnapScan</option>
        </select>

        <label className="mt-6 block text-sm font-medium text-foreground">Reference</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-foreground focus:border-gold focus:outline-none"
          placeholder="Tithe / Offering / Building Fund"
        />

        {method === "EFT" && (
          <div className="mt-6 rounded-lg border border-gold/20 bg-background/70 p-4">
            <label className="block text-sm font-medium text-foreground">
              Proof of payment slip
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:opacity-90"
              required
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Upload the EFT transfer confirmation or bank slip for verification.
            </p>
          </div>
        )}

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

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-semibold text-primary">Thank you</h2>
            <p className="mt-4 text-base text-muted-foreground">
              May the Lord bless you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
