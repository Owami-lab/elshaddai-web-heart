import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, UserResponse, Sermon, Department } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Elshaddai Ministries" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useAuth();

  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => api<UserResponse[]>("/api/users", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const sermons = useQuery({
    queryKey: ["sermons"],
    queryFn: () => api<Sermon[]>("/api/sermons"),
    enabled: user?.role === "ADMIN",
  });
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/api/departments"),
    enabled: user?.role === "ADMIN",
  });
  const giving = useQuery({
    queryKey: ["giving"],
    queryFn: () => api<any[]>("/api/giving/admin", { auth: true }),
    enabled: user?.role === "ADMIN",
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Admins only</h1>
        <p className="mt-4 text-muted-foreground">Please sign in with an admin account.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Access denied</h1>
        <p className="mt-4 text-muted-foreground">
          Your account doesn't have admin privileges.
        </p>
      </div>
    );
  }

  const cards = [
    { label: "Members", value: users.data?.length ?? "—" },
    { label: "Sermons", value: sermons.data?.length ?? "—" },
    { label: "Departments", value: depts.data?.length ?? "—" },
    { label: "Gifts Recorded", value: giving.data?.length ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="font-display text-5xl text-primary">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Overview of ministry activity.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <p className="text-xs uppercase tracking-wider text-gold">{c.label}</p>
            <p className="mt-2 font-display text-4xl text-primary">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-primary">Recent Giving</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Giver</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {giving.data?.map((g, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3">{g.dateTime?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    {g.name} {g.surname}
                  </td>
                  <td className="px-4 py-3">{g.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-medium">R {g.amount}</td>
                </tr>
              ))}
              {giving.data && giving.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No gifts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
