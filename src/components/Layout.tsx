import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";
import { UserCircle } from "lucide-react";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-gold"
      activeProps={{ className: "text-gold" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold text-primary"
              style={{ background: "var(--gradient-gold)" }}
            >
              E
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold text-primary-foreground">
                Elshaddai Ministries
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
                International
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/sermons">Sermons</NavLink>
            <NavLink to="/departments">Departments</NavLink>
            <NavLink to="/giving">Giving</NavLink>
            {user?.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 transition hover:text-gold"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.name || user.username}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.navigate({ to: "/" });
                  }}
                  className="rounded-md border border-red/40 bg-red px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red/90"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-foreground/80 hover:text-gold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md px-4 py-1.5 text-sm font-semibold text-primary shadow-gold transition hover:opacity-90"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  Join Us
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-primary-foreground/10 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl text-gold">Elshaddai Ministries</h3>
            <p className="mt-2 text-sm text-primary-foreground/70">
              A place of worship, fellowship, and transformation. All are welcome.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Visit</h4>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Sundays — 9:00 AM & 11:00 AM<br />
              Midweek — Wednesdays 6:30 PM
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Contact</h4>
            <p className="mt-2 text-sm text-primary-foreground/70">
              info@elshaddai.org<br />
              +27 21 000 0000
            </p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Elshaddai Ministries International. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
