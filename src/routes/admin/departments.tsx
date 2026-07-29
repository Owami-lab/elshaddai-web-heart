import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Department } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({ meta: [{ title: "Admin — Departments" }] }),
  component: AdminDepartments,
});

function emptyDept(): Partial<Department> {
  return { name: "", description: "" };
}

function AdminDepartments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: depts = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/api/departments", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const [editing, setEditing] = useState<Partial<Department> | null>(null);

  const save = useMutation({
    mutationFn: async (payload: Partial<Department> & { id?: number }) => {
      if (payload.id) {
        return api(`/api/departments/admin/update/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: payload.name ?? "",
            description: payload.description ?? "",
          }),
          auth: true,
        });
      }
      return api(`/api/departments/admin/create`, {
        method: "POST",
        body: JSON.stringify({
          name: payload.name ?? "",
          description: payload.description ?? "",
        }),
        auth: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });

  const del = useMutation({
    mutationFn: async (id: number) =>
      api(`/api/departments/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });

  if (!user) return <div className="p-6">Admins only</div>;
  if (user.role !== "ADMIN") return <div className="p-6">Access denied</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Manage Departments</h1>
        <button
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => setEditing(emptyDept())}
        >
          Add Department
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {depts.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-muted-foreground">{d.description}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm" onClick={() => setEditing(d)}>
                Edit
              </button>
              <button
                className="text-sm text-destructive"
                onClick={() => {
                  if (confirm("Delete department?")) del.mutate(d.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const payload: Partial<Department> & { id?: number } = { id: editing.id };
            payload.name = fd.get("name") as string;
            payload.description = fd.get("description") as string;
            save.mutate(payload, { onSuccess: () => setEditing(null) });
          }}
          className="mt-6 space-y-3 rounded border p-4"
        >
          <div>
            <label className="block text-sm">Name</label>
            <input
              name="name"
              defaultValue={editing.name ?? ""}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea
              name="description"
              defaultValue={editing.description ?? ""}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
              type="submit"
            >
              Save
            </button>
            <button
              type="button"
              className="rounded border px-4 py-2 text-sm"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
