import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Elshaddai Ministries" },
      { name: "description", content: "Get in touch with Elshaddai Ministries International." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Backend contact endpoint can be wired here when available.
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em]" style={{ color: "var(--church-red)" }}>
        Get in touch
      </span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Contact Us</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        We'd love to hear from you. Reach out for prayer, questions, or to plan your visit.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-8"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <h2 className="font-display text-2xl text-primary">Send a Message</h2>
          <label className="mt-6 block text-sm font-medium">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
          />
          <label className="mt-4 block text-sm font-medium">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
          />
          <label className="mt-4 block text-sm font-medium">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3"
          />
          <button
            type="submit"
            className="mt-6 w-full rounded-md py-3 font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--gradient-red)" }}
          >
            Send Message
          </button>
          {sent && (
            <p className="mt-4 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-primary">
              Thank you. We'll be in touch shortly.
            </p>
          )}
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
            <h3 className="font-display text-xl text-gold">Visit Us</h3>
            <p className="mt-3 text-sm text-primary-foreground/80">
              123 Faith Avenue<br />Cape Town, 8001<br />South Africa
            </p>
            <div className="mt-4 space-y-1 text-sm text-primary-foreground/80">
              <p>📞 +27 21 000 0000</p>
              <p>✉️ info@elshaddai.org</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Google Maps placeholder
            </div>
          </div>

          <div className="flex gap-3">
            {["Facebook", "Instagram", "YouTube", "X"].map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
