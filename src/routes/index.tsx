import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-sanctuary.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Sanctuary at golden hour"
          width={1600}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-32 md:py-48">
          <span className="rounded-full border border-gold/40 px-4 py-1 text-xs uppercase tracking-[0.25em] text-gold">
            Welcome Home
          </span>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-primary-foreground md:text-7xl">
            A house of worship for <em className="text-gold not-italic">every</em> nation.
          </h1>
          <p className="max-w-xl text-lg text-primary-foreground/80">
            Elshaddai Ministries International is a Christ-centered church committed to  <i>Reaching Nations with the Gospel </i> 
             through the preaching of God's Word, prayer, worship, and the love of Christ.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/sermons"
              className="rounded-md px-6 py-3 text-sm font-semibold text-primary shadow-gold transition hover:opacity-90"
              style={{ background: "var(--gradient-gold)" }}
            >
              Listen to Sermons
            </Link>
            <Link
              to="/about"
              className="rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Sunday Services",
              body: "Morning service every Sunday at 10:00 - 13:00. Children's church available.",
            },
            {
              title: "Bible Study",
              body: "Monday and Wednesdays at 6:00 PM. Dig deeper into the scriptures with our pastors.",
            },
            {
              title: "Community",
              body: "Join a department, serve the city, and grow in fellowship with believers.",
            },
          ].map((c) => (
            <article
              key={c.title}
              className="rounded-xl border border-border bg-card p-8 shadow-elegant transition hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <h3 className="font-display text-2xl text-primary">{c.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-display text-3xl italic leading-relaxed text-gold md:text-4xl">
            "I am the Almighty God; walk before Me and be blameless."
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-primary-foreground/60">
            Genesis 17:1
          </p>
        </div>
      </section>
    </>
  );
}
