import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, Department } from "@/lib/api";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Elshaddai Ministries" },
      { name: "description", content: "Discover the ministries and departments serving our church." },
    ],
  }),
  component: Departments,
});

function Departments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/api/departments"),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em] text-gold">Get Involved</span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Departments</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every member is a minister. Find a place to serve, grow, and belong.
      </p>

      {isLoading && <p className="mt-12 text-muted-foreground">Loading…</p>}
      {error && (
        <p className="mt-12 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          Could not load departments.
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((d) => (
          <article
            key={d.id}
            className="rounded-xl border border-border bg-card p-8 transition hover:-translate-y-1"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div
              className="mb-4 h-1 w-12 rounded-full"
              style={{ background: "var(--gradient-gold)" }}
            />
            <h3 className="font-display text-2xl text-primary">{d.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
