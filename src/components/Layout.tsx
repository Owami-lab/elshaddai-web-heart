import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ReactNode, useState } from "react";
import { Menu, UserCircle, X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-primary/10">
              <img
                src="/logo.png"
                alt="Elshaddai Ministries International Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold text-primary-foreground">
                Elshaddai Ministries
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold">International</div>
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

          <div className="hidden items-center gap-3 md:flex">
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

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Open menu"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 p-2 text-primary-foreground transition hover:border-primary-foreground hover:text-gold md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative mx-auto flex h-full max-w-md flex-col justify-center px-6 py-8">
            <div className="absolute right-4 top-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-950/95 p-2 text-white transition hover:text-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <div className="w-full rounded-3xl bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
              <nav className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-lg font-medium text-white transition hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium text-white transition hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/sermons"
                  className="text-lg font-medium text-white transition hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sermons
                </Link>
                <Link
                  to="/departments"
                  className="text-lg font-medium text-white transition hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Departments
                </Link>
                <Link
                  to="/giving"
                  className="text-lg font-medium text-white transition hover:text-gold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giving
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="text-lg font-medium text-white transition hover:text-gold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </nav>
              <div className="mt-8 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="rounded-md border border-slate-700 bg-slate-900/90 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-gold hover:text-gold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        router.navigate({ to: "/" });
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-md border border-red-500 bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-md border border-slate-700 bg-slate-900/90 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-gold hover:text-gold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-md bg-gold px-4 py-3 text-center text-sm font-semibold text-primary transition hover:opacity-90"
                      style={{ background: "var(--gradient-gold)" }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              Sundays — 10:00 AM - 1:00 PM
              <br />
              Midweek — Monday & Wednesdays 6:00 PM
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Contact</h4>
            <p className="mt-2 text-sm text-primary-foreground/70">
              info@elshaddai.org
              <br />
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
