import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Sermon } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — Elshaddai Ministries" },
      {
        name: "description",
        content: "Watch and listen to recent sermons from Elshaddai Ministries.",
      },
    ],
  }),
  component: Sermons,
});

function ytEmbed(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const fallbackSermons: Sermon[] = [
  {
    id: -1,
    title: "The Power of Consistent Prayer",
    preacher: "Pastor Daniel",
    description:
      "A powerful reminder that faithful prayer keeps our hearts aligned with God and strengthens our walk with Him.",
    date: "2026-06-14",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: -2,
    title: "Walking in Purpose",
    preacher: "Pastor Grace",
    description:
      "Discover how obedience and trust open the door to a life that reflects God’s calling with confidence and peace.",
    date: "2026-05-31",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  },
  {
    id: -3,
    title: "Hope in Every Season",
    preacher: "Pastor Michael",
    description:
      "An encouraging message about remaining anchored in faith when life feels uncertain or difficult.",
    date: "2026-05-17",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  },
];

function Sermons() {
  const { data, isLoading } = useQuery({
    queryKey: ["sermons"],
    queryFn: async () => {
      try {
        const sermons = await api<Sermon[]>("/api/sermons", { auth: true });
        return sermons.length > 0 ? sermons : fallbackSermons;
      } catch (error) {
        console.warn("Sermons API unavailable, showing local fallback content.", error);
        return fallbackSermons;
      }
    },
  });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const sermons = (data ?? fallbackSermons) as Sermon[];
  const usingFallbackSermons = sermons.some((sermon) => sermon.id < 0);

  const create = useMutation({
    mutationFn: async (payload: Partial<Sermon>) =>
      api("/api/sermons/admin/create", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sermons"] });
      setShowComposer(false);
      setEditingSermon(null);
      setFormMessage("Sermon saved");
      setTimeout(() => setFormMessage(""), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Save failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: Sermon) =>
      api(`/api/sermons/admin/update/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        auth: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sermons"] });
      setShowComposer(false);
      setEditingSermon(null);
      setFormMessage("Sermon updated");
      setTimeout(() => setFormMessage(""), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Update failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) =>
      api(`/api/sermons/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sermons"] });
      setFormMessage("Sermon deleted");
      setTimeout(() => setFormMessage(""), 3000);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || "Delete failed");
      setTimeout(() => setFormError(""), 5000);
    },
  });

  const openCreate = () => {
    setEditingSermon(null);
    setShowComposer(true);
    setFormError("");
    setFormMessage("");
  };

  const openEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setShowComposer(true);
    setFormError("");
    setFormMessage("");
  };

  const closeComposer = () => {
    setShowComposer(false);
    setEditingSermon(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em] text-gold">Recent Messages</span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Sermons</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Be encouraged and strengthened through the preached word.
      </p>

      {user?.role === "ADMIN" && (
        <div className="mt-6">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            + Add Sermon
          </button>

          {showComposer && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload = {
                  id: editingSermon?.id,
                  title: (fd.get("title") as string) || "",
                  preacher: (fd.get("preacher") as string) || "",
                  description: (fd.get("description") as string) || "",
                  date: (fd.get("date") as string) || "",
                  videoUrl: (fd.get("videoUrl") as string) || "",
                } as Sermon;

                if (editingSermon?.id) {
                  update.mutate(payload);
                } else {
                  create.mutate(payload);
                }
              }}
              className="mt-4 space-y-3 rounded border bg-card p-4"
            >
              {formMessage && <div className="text-sm text-green-600">{formMessage}</div>}
              {formError && <div className="text-sm text-destructive">{formError}</div>}
              <div>
                <label className="block text-sm">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={editingSermon?.title ?? ""}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Preacher</label>
                <input
                  name="preacher"
                  defaultValue={editingSermon?.preacher ?? ""}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Date</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={editingSermon?.date ?? ""}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Video URL / Link</label>
                <input
                  name="videoUrl"
                  defaultValue={editingSermon?.videoUrl ?? ""}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingSermon?.description ?? ""}
                  className="w-full rounded border px-2 py-1"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  {editingSermon ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="rounded border px-4 py-2 text-sm"
                  onClick={closeComposer}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isLoading && <p className="mt-12 text-muted-foreground">Loading sermons…</p>}
  

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sermons.map((s) => {
          const embed = ytEmbed(s.videoUrl);
          return (
            <article
              key={s.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedSermon(s)}
              >
                <div className="aspect-video bg-primary/10">
                  {embed ? (
                    <iframe
                      src={embed}
                      title={s.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : s.videoUrl ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Click to open video
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No video available
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-gold">{s.date}</p>
                  <h3 className="mt-2 font-display text-xl text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">by {s.preacher}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </button>

              {user?.role === "ADMIN" && (
                <div className="flex gap-2 border-t border-border bg-background/60 px-6 py-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(s);
                    }}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete “${s.title}”?`)) remove.mutate(s.id);
                    }}
                    className="rounded border px-3 py-2 text-sm text-destructive"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {sermons.length === 0 && (
        <p className="mt-12 text-muted-foreground">No sermons published yet. Check back soon.</p>
      )}

      {selectedSermon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">Now playing</p>
                <h2 className="font-display text-2xl text-primary">{selectedSermon.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSermon(null)}
                className="rounded-full border px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="aspect-video bg-black">
                {ytEmbed(selectedSermon.videoUrl) ? (
                  <iframe
                    src={ytEmbed(selectedSermon.videoUrl)!}
                    title={selectedSermon.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedSermon.videoUrl ? (
                  <video controls className="h-full w-full" src={selectedSermon.videoUrl} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No video available
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-border p-5 lg:border-l lg:border-t-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Speaker</p>
                  <p className="mt-1 font-medium text-foreground">
                    {selectedSermon.preacher || "Unknown preacher"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Date</p>
                  <p className="mt-1 text-foreground">{selectedSermon.date || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Details</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {selectedSermon.description || "No additional details provided."}
                  </p>
                </div>
                {selectedSermon.videoUrl && (
                  <a
                    href={selectedSermon.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm text-primary underline"
                  >
                    Open source link
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
