import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store } from "@/lib/storage";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/submissions")({ component: () => <Guard role="student"><MySubs /></Guard> });

function MySubs() {
  const { user } = useAuth();
  const subs = store.getSubmissions().filter((s) => s.studentId === user!.id).sort((a,b) => b.timestamp - a.timestamp);
  const quizResults = store.getQuizResults().filter((r) => r.studentId === user!.id).sort((a,b) => b.timestamp - a.timestamp);
  const problems = store.getProblems();
  const quizzes = store.getQuizzes();
  return (
    <Shell>
      <h1 className="text-3xl font-bold">My Submissions</h1>

      <h2 className="mt-6 text-lg font-semibold">Coding — Auto-Graded</h2>
      <div className="mt-2 space-y-3">
        {subs.length === 0 && <GlassCard tint="plain" className="p-6 text-sm text-muted-foreground">No coding submissions yet — solve a problem to get an instant score.</GlassCard>}
        {subs.map((s) => {
          const p = problems.find((x) => x.id === s.problemId);
          return (
            <GlassCard key={s.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-semibold">{p?.title || s.problemId}</div>
                <div className="text-xs text-muted-foreground">{s.language} · {new Date(s.timestamp).toLocaleString()} · {s.passed}/{s.total} tests</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs bg-pastel-mint">{s.status}</span>
                <div className="text-xl font-black">{s.marks}<span className="text-xs text-muted-foreground">/{s.maxMarks}</span></div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Quizzes — Auto-Graded</h2>
      <div className="mt-2 space-y-3">
        {quizResults.length === 0 && <GlassCard tint="plain" className="p-6 text-sm text-muted-foreground">No quiz attempts yet.</GlassCard>}
        {quizResults.map((r) => {
          const q = quizzes.find((x) => x.id === r.quizId);
          const shown = r.finalScore ?? r.score;
          return (
            <GlassCard key={r.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-semibold">{q?.title || r.quizId}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs bg-pastel-mint">Auto-Graded</span>
                <div className="text-xl font-black">{shown}<span className="text-xs text-muted-foreground">/{r.total}</span></div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </Shell>
  );
}