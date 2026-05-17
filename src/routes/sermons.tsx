import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, Sermon } from "@/lib/api";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — Elshaddai Ministries" },
      { name: "description", content: "Watch and listen to recent sermons from Elshaddai Ministries." },
    ],
  }),
  component: Sermons,
});

function ytEmbed(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function Sermons() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sermons"],
    queryFn: () => api<Sermon[]>("/api/sermons"),
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em] text-gold">Recent Messages</span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">Sermons</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Be encouraged and strengthened through the preached word.
      </p>

      {isLoading && <p className="mt-12 text-muted-foreground">Loading sermons…</p>}
      {error && (
        <p className="mt-12 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          Could not reach the sermon library. Please try again later.
        </p>
      )}

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((s) => {
          const embed = ytEmbed(s.videoUrl);
          return (
            <article
              key={s.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-elegant)" }}
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
            </article>
          );
        })}
      </div>

      {data && data.length === 0 && (
        <p className="mt-12 text-muted-foreground">No sermons published yet. Check back soon.</p>
      )}
    </div>
  );
}
