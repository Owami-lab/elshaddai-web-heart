import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Sermon } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/admin/sermons")({
  head: () => ({ meta: [{ title: "Admin — Sermons" }] }),
  component: AdminSermons,
});

function emptySermon(): Partial<Sermon> {
  return { title: "", preacher: "", description: "", date: "", videoUrl: "" };
}

function AdminSermons() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: sermons = [] } = useQuery({
    queryKey: ["sermons"],
    queryFn: () => api<Sermon[]>("/api/sermons", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const [editing, setEditing] = useState<Partial<Sermon> | null>(null);

  const save = useMutation({
    mutationFn: async (payload: Partial<Sermon> & { id?: number }) => {
      if (payload.id) {
        return api(`/api/sermons/admin/update/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          auth: true,
        });
      }
      return api(`/api/sermons/admin/create`, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sermons"] }),
  });

  const del = useMutation({
    mutationFn: async (id: number) =>
      api(`/api/sermons/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sermons"] }),
  });

  if (!user) return <div className="p-6">Admins only</div>;
  if (user.role !== "ADMIN") return <div className="p-6">Access denied</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Manage Sermons</h1>
        <button
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => setEditing(emptySermon())}
        >
          Add Sermon
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {sermons.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-muted-foreground">
                {s.preacher} — {s.date}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm" onClick={() => setEditing(s)}>
                Edit
              </button>
              <button
                className="text-sm text-destructive"
                onClick={() => {
                  if (confirm("Delete sermon?")) del.mutate(s.id);
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
            const payload: Partial<Sermon> & { id?: number } = { id: editing.id };
            payload.title = fd.get("title") as string;
            payload.preacher = fd.get("preacher") as string;
            payload.description = fd.get("description") as string;
            payload.date = fd.get("date") as string;
            payload.videoUrl = fd.get("videoUrl") as string;
            save.mutate(payload, { onSuccess: () => setEditing(null) });
          }}
          className="mt-6 space-y-3 rounded border p-4"
        >
          <div>
            <label className="block text-sm">Title</label>
            <input
              name="title"
              defaultValue={editing.title ?? ""}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Preacher</label>
            <input
              name="preacher"
              defaultValue={editing.preacher ?? ""}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Date</label>
            <input
              name="date"
              defaultValue={editing.date ?? ""}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Video URL</label>
            <input
              name="videoUrl"
              defaultValue={editing.videoUrl ?? ""}
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
