import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store } from "@/lib/storage";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/submissions")({ component: () => <Guard role="admin"><Analytics /></Guard> });

function Analytics() {
  const quizzes = store.getQuizzes();
  const results = store.getQuizResults();
  const users = store.getUsers();
  const [qid, setQid] = useState<string>(quizzes[0]?.id || "");
  const quiz = quizzes.find((q) => q.id === qid);
  const attempts = results.filter((r) => r.quizId === qid);

  const stats = useMemo(() => {
    if (!quiz || attempts.length === 0) return null;
    const scores = attempts.map((a) => a.finalScore ?? a.score ?? 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores), min = Math.min(...scores);
    const buckets = [0, 20, 40, 60, 80, 100].map((p, i, arr) => {
      const lo = p, hi = arr[i + 1] ?? 101;
      const count = attempts.filter((a) => {
        const pct = ((a.finalScore ?? a.score ?? 0) / (a.total || 1)) * 100;
        return pct >= lo && pct < hi;
      }).length;
      return { range: `${lo}-${hi === 101 ? 100 : hi - 1}%`, count };
    });
    return { avg, max, min, buckets };
  }, [quiz, attempts]);

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Quiz Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1">Attempts, averages, and score distribution.</p>

      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="mint" className="p-5"><div className="text-xs uppercase">Total attempts</div><div className="text-3xl font-black">{results.length}</div></GlassCard>
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase">Quizzes</div><div className="text-3xl font-black">{quizzes.length}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase">Students attempted</div><div className="text-3xl font-black">{new Set(results.map((r) => r.studentId)).size}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase">Avg score %</div><div className="text-3xl font-black">{results.length === 0 ? 0 : Math.round(results.reduce((a, b) => a + ((b.finalScore ?? b.score ?? 0) / (b.total || 1)) * 100, 0) / results.length)}%</div></GlassCard>
      </div>

      <GlassCard tint="plain" className="p-6 mt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-semibold">Quiz:</label>
          <select value={qid} onChange={(e) => setQid(e.target.value)} className="rounded-md border px-3 py-2 text-sm bg-white">
            {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>

        {!quiz ? <div className="text-sm text-muted-foreground mt-4">No quiz selected.</div> :
          !stats ? <div className="text-sm text-muted-foreground mt-4">No attempts yet.</div> : (
          <>
            <div className="grid gap-4 sm:grid-cols-4 mt-4">
              <div className="rounded-xl p-4 bg-pastel-mint/40"><div className="text-xs uppercase">Attempts</div><div className="text-2xl font-black">{attempts.length}</div></div>
              <div className="rounded-xl p-4 bg-pastel-sky/40"><div className="text-xs uppercase">Average</div><div className="text-2xl font-black">{stats.avg.toFixed(1)}</div></div>
              <div className="rounded-xl p-4 bg-pastel-yellow/40"><div className="text-xs uppercase">High</div><div className="text-2xl font-black">{stats.max}</div></div>
              <div className="rounded-xl p-4 bg-pastel-pink/40"><div className="text-xs uppercase">Low</div><div className="text-2xl font-black">{stats.min}</div></div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Score distribution</h3>
              <div className="h-64 bg-white/60 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.buckets}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="range" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <h3 className="font-semibold text-sm mb-2">Attempts</h3>
              <table className="w-full text-sm">
                <thead className="bg-white/60"><tr className="text-left"><th className="p-2">Student</th><th className="p-2">Score</th><th className="p-2">%</th><th className="p-2">Status</th><th className="p-2">When</th></tr></thead>
                <tbody>
                  {attempts.map((a) => {
                    const u = users.find((x) => x.id === a.studentId);
                    const s = a.finalScore ?? a.score ?? 0;
                    return (
                      <tr key={a.id} className="border-t border-white/60">
                        <td className="p-2">{u?.name || a.studentId}</td>
                        <td className="p-2">{s}/{a.total}</td>
                        <td className="p-2">{Math.round((s / (a.total || 1)) * 100)}%</td>
                        <td className="p-2"><span className="text-xs px-2 py-0.5 rounded-full bg-pastel-mint">{a.status}</span></td>
                        <td className="p-2 text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>
    </Shell>
  );
}