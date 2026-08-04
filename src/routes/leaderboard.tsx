import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { store } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { Navigate } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({ component: LB });

function LB() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const users = store.getUsers().filter((u) => u.role === "student");
  const results = store.getQuizResults();
  const subs = store.getSubmissions();
  const rows = users.map((u) => {
    const quiz = results.filter((r) => r.studentId === u.id).reduce((a, b) => a + (b.finalScore ?? b.score ?? 0), 0);
    const code = subs.filter((s) => s.studentId === u.id).reduce((a, b) => a + (b.marks || 0), 0);
    return { u, quiz, code, total: quiz + code };
  }).sort((a, b) => b.total - a.total);

  const medal = ["🥇","🥈","🥉"];
  return (
    <Shell>
      <div className="flex items-center gap-2"><Trophy className="h-7 w-7" /><h1 className="text-3xl font-bold">Leaderboard</h1></div>
      <p className="text-sm text-muted-foreground">Combined auto-graded quiz + coding marks.</p>
      <GlassCard tint="plain" className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/60">
            <tr className="text-left">
              <th className="p-3">Rank</th><th className="p-3">Student</th>
              <th className="p-3 hidden sm:table-cell">Register No</th>
              <th className="p-3 hidden md:table-cell">Dept · Year</th>
              <th className="p-3 text-right">Quiz</th><th className="p-3 text-right">Coding</th><th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.u.id} className={`border-t border-white/60 ${r.u.id === user.id ? "bg-pastel-yellow/40" : ""}`} title={`${r.u.department || ""} · ${r.u.year || ""}`}>
                <td className="p-3 font-bold">{medal[i] || `#${i + 1}`}</td>
                <td className="p-3">{r.u.name}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{r.u.registerNo}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{[r.u.department, r.u.year].filter(Boolean).join(" · ")}</td>
                <td className="p-3 text-right">{r.quiz}</td>
                <td className="p-3 text-right">{r.code}</td>
                <td className="p-3 text-right font-bold">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </Shell>
  );
}