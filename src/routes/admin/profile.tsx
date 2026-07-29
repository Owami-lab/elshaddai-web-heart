import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, UserResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Admin — Profiles" }] }),
  component: AdminProfiles,
});

function AdminProfiles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<UserResponse[]>("/api/users", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const [editing, setEditing] = useState<UserResponse | null>(null);

  const save = useMutation({
    mutationFn: async (payload: Partial<UserResponse> & { id: number }) =>
      api(`/api/users/admin/update/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        auth: true,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const del = useMutation({
    mutationFn: async (id: number) => api(`/api/users/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  if (!user) return <div className="p-6">Admins only</div>;
  if (user.role !== "ADMIN") return <div className="p-6">Access denied</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Manage Profiles</h1>
      </div>

      <div className="mt-6 space-y-4">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <div className="font-medium">
                {u.name} {u.surname}
              </div>
              <div className="text-sm text-muted-foreground">
                {u.email} — {u.username}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm" onClick={() => setEditing(u)}>
                Edit
              </button>
              <button
                className="text-sm text-destructive"
                onClick={() => {
                  if (confirm("Delete user?")) del.mutate(u.id);
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
            const payload: Partial<UserResponse> & { id: number } = { id: editing.id };
            payload.name = fd.get("name") as string;
            payload.surname = fd.get("surname") as string;
            payload.email = fd.get("email") as string;
            payload.username = fd.get("username") as string;
            payload.role = fd.get("role") as string;
            save.mutate(payload, { onSuccess: () => setEditing(null) });
          }}
          className="mt-6 space-y-3 rounded border p-4"
        >
          <div>
            <label className="block text-sm">First name</label>
            <input
              name="name"
              defaultValue={editing.name}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Surname</label>
            <input
              name="surname"
              defaultValue={editing.surname}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              name="email"
              defaultValue={editing.email}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Username</label>
            <input
              name="username"
              defaultValue={editing.username}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Role</label>
            <select
              name="role"
              defaultValue={editing.role}
              className="w-full rounded border px-2 py-1"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
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
