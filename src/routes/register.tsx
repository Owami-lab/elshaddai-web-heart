import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Join Us — Elshaddai Ministries" }] }),
  component: Register,
});

const fields = [
  { name: "name", label: "First Name" },
  { name: "surname", label: "Surname" },
  { name: "email", label: "Email", type: "email" },
  { name: "username", label: "Username" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
] as const;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (data.password !== data.confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await register(data as Record<string, string>);
      // backend may return { pendingVerification: true } or { recovered: true }
      const email = encodeURIComponent((data.email as string) || "");
      if (res && (res.pendingVerification || res.recovered)) {
        navigate({ to: `/verify-sent?email=${email}` });
      } else {
        navigate({ to: "/login" });
      }
    } catch (e: unknown) {
      // backend may return JSON like { message: 'Email already exists' }
      let msg = e instanceof Error ? e.message : "Registration failed";
      try {
        const parsed = JSON.parse(msg);
        if (parsed && parsed.message) msg = parsed.message;
      } catch {
        /* not JSON */
      }
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-20">
      <h1 className="font-display text-4xl text-primary">Join the family</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your Elshaddai account to engage with our community.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.name === "address" ? "md:col-span-2" : undefined}>
            <label className="text-sm font-medium text-foreground">{f.label}</label>
            <input
              type={"type" in f ? f.type : "text"}
              required
              value={data[f.name] || ""}
              onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2.5 focus:border-gold focus:outline-none"
            />
          </div>
        ))}

        {err && (
          <p className="md:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {err}
          </p>
        )}

        <button
          disabled={loading}
          className="md:col-span-2 mt-2 rounded-md py-3 font-semibold text-primary shadow-gold transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}
        >
          {loading ? "Creating…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link to="/login" className="font-semibold text-gold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
