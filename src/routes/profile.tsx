import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { LogOut, Mail, Shield, User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Elshaddai Ministries" }],
  }),
  component: Profile,
});

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-primary">Not signed in</h1>
        <p className="mt-4 text-muted-foreground">Please sign in to view your profile.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <span className="text-xs uppercase tracking-[0.25em] text-red">My Account</span>
      <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">Profile</h1>

      <div
        className="mt-10 rounded-2xl border border-border bg-card p-8"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-5">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold font-display text-2xl font-bold text-primary"
            style={{ background: "var(--gradient-gold)" }}
          >
            {user.name?.charAt(0) || user.username.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl text-primary">
              {user.name || user.username}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10">
              <User className="h-5 w-5 text-red" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Username</p>
              <p className="font-medium text-foreground">{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10">
              <Mail className="h-5 w-5 text-red" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
              <p className="font-medium text-foreground">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-md border border-red/30 bg-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red/90"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
