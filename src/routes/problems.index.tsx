import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/problems/")({ component: () => <Guard role="student"><ProblemList /></Guard> });

function ProblemList() {
  const all = store.getProblems().filter((p) => !p.isHidden && p.category.toLowerCase() !== "debugging");
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<string>("All");
  const filtered = all.filter((p) => (diff === "All" || p.difficulty === diff) && p.title.toLowerCase().includes(q.toLowerCase()));
  const diffs = ["All", "Easy", "Medium", "Hard"];
  const colors: Record<string, string> = { Easy: "bg-pastel-mint", Medium: "bg-pastel-yellow", Hard: "bg-pastel-pink" };

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Coding Problems</h1>
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <Input placeholder="Search problems..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-white/80" />
        <div className="flex gap-1">
          {diffs.map((d) => (
            <button key={d} onClick={() => setDiff(d)} className={`px-3 py-1.5 rounded-full text-sm ${diff === d ? "bg-foreground text-background" : "bg-white/70"}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((p) => (
          <GlassCard key={p.id} tint="plain" className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold text-lg">{p.title}</div>
              <div className="text-xs mt-1 flex gap-2">
                <span className={`px-2 py-0.5 rounded-full ${colors[p.difficulty]}`}>{p.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/80">{p.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/80">{p.marks} pts</span>
              </div>
            </div>
            <Button asChild><Link to="/problems/$id" params={{ id: p.id }}>Solve →</Link></Button>
          </GlassCard>
        ))}
        {filtered.length === 0 && <div className="text-muted-foreground text-sm">No problems match.</div>}
      </div>
    </Shell>
  );
}