import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, LayoutDashboard, ListChecks, Trophy, User as UserIcon, Bug, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/quizzes", label: "Quizzes", icon: ListChecks },
    { to: "/problems", label: "Problems", icon: Code2 },
    { to: "/debugging", label: "Debugging", icon: Bug },
    { to: "/submissions", label: "My Submissions", icon: UserIcon },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  const adminLinks = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/submissions", label: "Analytics", icon: BarChart3 },
    { to: "/admin/coding", label: "Coding Log", icon: Code2 },
    { to: "/admin/quizzes", label: "Quizzes", icon: ListChecks },
    { to: "/admin/problems", label: "Problems", icon: Code2 },
    { to: "/admin/debugging", label: "Debugging", icon: Bug },
    { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  ];
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.03_160)] via-[oklch(0.98_0.02_300)] to-[oklch(0.97_0.03_340)]">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pastel-mint to-pastel-lavender grid place-items-center shadow-sm shrink-0">
              <Code2 className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold leading-tight truncate">DMI ENGINEERING COLLEGE</div>
              <div className="text-xs text-muted-foreground truncate">Department of Information Technology</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.name} · <span className="capitalize">{user.role}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => { logout(); router.navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
                <Button asChild size="sm"><Link to="/register">Register</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav className="mx-auto max-w-7xl px-4 pt-4 flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-full text-sm bg-white/70 border border-white hover:bg-white transition-all shadow-sm hover:-translate-y-0.5"
              activeProps={{ className: "px-3 py-1.5 rounded-full text-sm bg-foreground text-background border border-foreground shadow" }}
            >
              <span className="inline-flex items-center gap-1.5"><l.icon className="h-3.5 w-3.5" />{l.label}</span>
            </Link>
          ))}
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DMI Engineering College · Department of Information Technology
      </footer>
    </div>
  );
}

export function GlassCard({ children, className = "", tint = "mint" }: { children: ReactNode; className?: string; tint?: "mint" | "pink" | "lavender" | "yellow" | "sky" | "plain" }) {
  const tints: Record<string, string> = {
    mint: "bg-pastel-mint/40",
    pink: "bg-pastel-pink/40",
    lavender: "bg-pastel-lavender/40",
    yellow: "bg-pastel-yellow/40",
    sky: "bg-pastel-sky/40",
    plain: "bg-white/70",
  };
  return (
    <div className={`rounded-2xl border border-white/60 shadow-sm backdrop-blur ${tints[tint]} ${className}`}>{children}</div>
  );
}