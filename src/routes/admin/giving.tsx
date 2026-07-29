import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, GivingEntry } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/giving")({
  head: () => ({ meta: [{ title: "Admin — Giving" }] }),
  component: AdminGiving,
});

function AdminGiving() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: gifts = [] } = useQuery({
    queryKey: ["giving"],
    queryFn: () => api<GivingEntry[]>("/api/giving/admin", { auth: true }),
    enabled: user?.role === "ADMIN",
  });

  const del = useMutation({
    mutationFn: async (id: number) => api(`/api/giving/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["giving"] }),
  });

  if (!user) return <div className="p-6">Admins only</div>;
  if (user.role !== "ADMIN") return <div className="p-6">Access denied</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl">Manage Giving</h1>
      <div className="mt-6 overflow-hidden rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Giver</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((g: GivingEntry) => (
              <tr key={g.id} className="border-t">
                <td className="px-4 py-2">{g.dateTime?.slice(0, 10)}</td>
                <td className="px-4 py-2">
                  {g.name} {g.surname}
                </td>
                <td className="px-4 py-2">{g.paymentMethod}</td>
                <td className="px-4 py-2 text-right">R {g.amount}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-sm text-destructive"
                    onClick={() => {
                      if (confirm("Delete gift?")) del.mutate(g.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
