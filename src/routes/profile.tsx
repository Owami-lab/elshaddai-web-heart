import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Elshaddai Ministries" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<any>("/api/users/me", { auth: true }),
    enabled: !!user,
  });

  const myGiving = useQuery({
    queryKey: ["my-giving"],
    queryFn: () => api<any[]>("/api/giving", { auth: true }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Sign in required</h1>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const p = me.data || {};
  const total = (myGiving.data || []).reduce((s, g) => s + Number(g.amount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-5xl text-primary">My Profile</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div
          className="rounded-2xl border border-border bg-card p-6 text-center"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full font-display text-3xl font-bold text-primary"
            style={{ background: "var(--gradient-gold)" }}
          >
            {(p.name || user.username)[0]?.toUpperCase()}
          </div>
          <h2 className="mt-4 font-display text-xl text-primary">
            {p.name} {p.surname}
          </h2>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--church-red)" }}>
            {p.role || user.role}
          </p>
        </div>

        <div className="space-y-6">
          <section
            className="rounded-2xl border border-border bg-card p-8"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <h3 className="font-display text-2xl text-primary">Personal Information</h3>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Username", p.username || user.username],
                ["Email", p.email],
                ["Phone", p.phone || "—"],
                ["Address", p.address || "—"],
                ["Gender", p.gender || "—"],
                ["Department", p.department || "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm text-foreground">{v as string}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className="rounded-2xl border border-border bg-card p-8"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-primary">My Giving</h3>
              <span className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-gold">R {total.toFixed(2)}</span>
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(myGiving.data || []).map((g, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3">{g.dateTime?.slice(0, 10)}</td>
                      <td className="px-4 py-3">{g.category || "Offering"}</td>
                      <td className="px-4 py-3">{g.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-medium">R {g.amount}</td>
                    </tr>
                  ))}
                  {myGiving.data && myGiving.data.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                        No contributions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
