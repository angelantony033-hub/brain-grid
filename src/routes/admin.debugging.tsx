import { createFileRoute } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store, uid } from "@/lib/storage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { CodingProblem } from "@/lib/types";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/debugging")({ component: () => <Guard role="admin"><DAdmin /></Guard> });

function DAdmin() {
  const [items, setItems] = useState<CodingProblem[]>(store.getProblems());
  const debugs = items.filter((p) => p.category.toLowerCase() === "debugging");

  function upsert(p: CodingProblem) {
    const all = store.getProblems();
    const i = all.findIndex((x) => x.id === p.id);
    if (i < 0) all.push(p); else all[i] = p;
    store.setProblems(all); setItems(all); toast.success("Saved");
  }
  function del(id: string) {
    const all = store.getProblems().filter((x) => x.id !== id);
    store.setProblems(all); setItems(all); toast.success("Deleted");
  }
  function toggleHide(id: string) {
    const all = store.getProblems();
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return;
    all[i] = { ...all[i], isHidden: !all[i].isHidden };
    store.setProblems(all); setItems(all);
  }

  function newOne() {
    upsert({ id: uid(), title: "New Debugging Task", description: "Fix the bug in the given code.", inputFormat: "See samples.", outputFormat: "See samples.", constraints: "", difficulty: "Easy", category: "Debugging", marks: 20, samples: [{ input: "", expected: "" }], hiddenTests: [], isHidden: false, referenceSolution: "" });
  }

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Manage Debugging</h1>
        <Button onClick={newOne}><Plus className="h-4 w-4" /> New</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Use the Manage Problems page (with category = Debugging) for full editing. This page lets you quickly rename, hide, or delete debugging tasks.</p>

      <div className="mt-6 space-y-3">
        {debugs.map((p) => (
          <GlassCard key={p.id} tint="plain" className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-64">
              <Input value={p.title} onChange={(e) => upsert({ ...p, title: e.target.value })} className="font-semibold" />
              <div className="text-xs text-muted-foreground mt-1">{p.difficulty} · {p.marks}pts {p.isHidden && <span className="ml-2 px-2 py-0.5 rounded-full bg-pastel-yellow">Hidden</span>}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleHide(p.id)}>{p.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
              <Button size="sm" variant="destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </GlassCard>
        ))}
        {debugs.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No debugging tasks yet.</div>}
      </div>
    </Shell>
  );
}