import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/admin/coding")({ component: () => <Guard role="admin"><CodingLog /></Guard> });

function CodingLog() {
  const subs = store.getSubmissions().sort((a, b) => b.timestamp - a.timestamp);
  const users = store.getUsers();
  const problems = store.getProblems();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = subs.find((s) => s.id === openId);
  const openProb = open ? problems.find((p) => p.id === open.problemId) : null;
  const openStu = open ? users.find((u) => u.id === open.studentId) : null;

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Coding Submissions Log</h1>
      <p className="text-sm text-muted-foreground mt-1">Read-only. Coding scores are auto-graded against all test cases (visible + hidden). Use this view for auditing and plagiarism checks.</p>
      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <GlassCard tint="plain" className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="text-xs uppercase text-muted-foreground mb-2">All coding submissions</div>
          <ul className="space-y-2">
            {subs.map((s) => {
              const stu = users.find((u) => u.id === s.studentId);
              const prob = problems.find((p) => p.id === s.problemId);
              return (
                <li key={s.id}>
                  <button onClick={() => setOpenId(s.id)} className={`w-full text-left p-3 rounded-lg border transition-all ${openId === s.id ? "bg-foreground text-background" : "bg-white/60 hover:bg-white"}`}>
                    <div className="flex justify-between gap-2 flex-wrap">
                      <div className="font-medium">{stu?.name} · {prob?.title}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-mint text-foreground">{s.marks}/{s.maxMarks}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">{s.language} · {s.passed}/{s.total} tests · {new Date(s.timestamp).toLocaleString()}</div>
                  </button>
                </li>
              );
            })}
            {subs.length === 0 && <li className="text-sm text-muted-foreground">No coding submissions yet.</li>}
          </ul>
        </GlassCard>

        <GlassCard tint="plain" className="p-4">
          {!open ? (
            <div className="text-sm text-muted-foreground p-6 text-center">Select a submission to inspect.</div>
          ) : (
            <div>
              <div className="font-bold">{openStu?.name} · {openProb?.title}</div>
              <div className="text-xs text-muted-foreground">{open.language} · {new Date(open.timestamp).toLocaleString()}</div>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-pastel-mint text-xs font-semibold">Auto-Graded · {open.marks}/{open.maxMarks} · {open.passed}/{open.total} tests</div>
              <pre className="mt-3 max-h-72 overflow-auto text-xs bg-[#1e1e1e] text-white p-3 rounded-lg font-mono">{open.code}</pre>
              <div className="mt-3 space-y-1">
                {open.testResults.map((t, i) => (
                  <div key={i} className={`rounded-lg p-2 text-xs ${t.pass ? "bg-pastel-mint/60" : "bg-pastel-pink/60"}`}>
                    <div className="font-semibold">{t.name}{t.hidden ? " (hidden)" : ""}: {t.pass ? "Passed ✓" : "Failed ✗"}</div>
                    {!t.pass && <div className="mt-1">Got: <code>{t.got || "(empty)"}</code> · Expected: <code>{t.expected}</code></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </Shell>
  );
}