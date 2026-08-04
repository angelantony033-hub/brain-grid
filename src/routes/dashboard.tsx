import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { useAuth } from "@/lib/auth";
import { store } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Code2, ListChecks, Trophy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: () => <Guard role="student"><Dashboard /></Guard> });

function Dashboard() {
  const { user } = useAuth();
  const quizzes = store.getQuizzes().filter((q) => !q.isHidden);
  const problems = store.getProblems().filter((p) => !p.isHidden);
  const results = store.getQuizResults().filter((r) => r.studentId === user!.id);
  const subs = store.getSubmissions().filter((s) => s.studentId === user!.id);
  const quizScore = results.reduce((a, b) => a + (b.finalScore ?? b.score ?? 0), 0);
  const codingScore = subs.reduce((a, b) => a + (b.marks || 0), 0);

  return (
    <Shell>
      <GlassCard tint="mint" className="p-8">
        <div className="text-sm text-muted-foreground">Welcome back,</div>
        <h1 className="text-3xl font-bold">{user!.name} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Register No: {user!.registerNo} · {user!.department}{user!.year ? ` · ${user!.year}` : ""}</p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase text-muted-foreground">Quiz score</div><div className="text-3xl font-black mt-1">{quizScore}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase text-muted-foreground">Coding score</div><div className="text-3xl font-black mt-1">{codingScore}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase text-muted-foreground">Attempts</div><div className="text-3xl font-black mt-1">{results.length + subs.length}</div></GlassCard>
        <GlassCard tint="sky" className="p-5"><div className="text-xs uppercase text-muted-foreground">Total</div><div className="text-3xl font-black mt-1">{quizScore + codingScore}</div></GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <GlassCard tint="plain" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><ListChecks className="h-5 w-5" />Available Quizzes</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/quizzes">View all</Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {quizzes.slice(0, 4).map((q) => (
              <li key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-muted-foreground">{q.topic} · {q.difficulty} · {q.timeLimit}min</div>
                </div>
                <Button asChild size="sm"><Link to="/quizzes/$id" params={{ id: q.id }}>Start</Link></Button>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard tint="plain" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><Code2 className="h-5 w-5" />Coding Problems</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/problems">View all</Link></Button>
          </div>
          <ul className="mt-3 space-y-2">
            {problems.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.category} · {p.difficulty} · {p.marks}pts</div>
                </div>
                <Button asChild size="sm"><Link to="/problems/$id" params={{ id: p.id }}>Solve</Link></Button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-6">
        <Button asChild variant="secondary"><Link to="/leaderboard"><Trophy className="h-4 w-4" /> View Leaderboard</Link></Button>
      </div>
    </Shell>
  );
}