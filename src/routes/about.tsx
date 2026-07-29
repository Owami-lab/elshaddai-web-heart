import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Elshaddai Ministries International" },
      {
        name: "description",
        content:
          "Learn about our mission, vision and pastoral leadership at Elshaddai Ministries International.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em] text-gold">Our Story</span>
      <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">About Elshaddai</h1>
      <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
        Elshaddai Ministries International is a Christ-centered, Spirit-led church committed to
        making disciples, equipping leaders, and demonstrating the love of Jesus in our city and
        beyond.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl text-primary">Our Mission</h2>
          <p className="mt-3 text-muted-foreground">
            To preach the gospel of Jesus Christ to all nations, raising up disciples who walk in
            the fullness of God's calling.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl text-primary">Our Vision</h2>
          <p className="mt-3 text-muted-foreground">
            A thriving, multi-generational community transformed by God's word and empowered by His
            Spirit.
          </p>
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-primary p-10 text-primary-foreground">
        <h2 className="font-display text-3xl text-gold">What We Believe</h2>
        <ul className="mt-6 grid gap-3 text-sm text-primary-foreground/80 md:grid-cols-2">
          <li>• The Bible is the inspired Word of God.</li>
          <li>• Salvation is by grace through faith in Jesus Christ.</li>
          <li>• The Holy Spirit empowers every believer.</li>
          <li>• The Church is the body of Christ on earth.</li>
        </ul>
      </div>
    </div>
  );
}
