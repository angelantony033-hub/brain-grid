import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({ component: () => <Guard role="admin"><AdminDash /></Guard> });

function AdminDash() {
  const students = store.getUsers().filter((u) => u.role === "student").length;
  const subs = store.getSubmissions();
  const quizResults = store.getQuizResults();
  const quizzes = store.getQuizzes().length;
  const problems = store.getProblems().length;
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-4 mt-6">
        <GlassCard tint="mint" className="p-5"><div className="text-xs uppercase">Students</div><div className="text-3xl font-black">{students}</div></GlassCard>
        <GlassCard tint="pink" className="p-5"><div className="text-xs uppercase">Coding Submissions</div><div className="text-3xl font-black">{subs.length}</div></GlassCard>
        <GlassCard tint="yellow" className="p-5"><div className="text-xs uppercase">Quiz Attempts</div><div className="text-3xl font-black">{quizResults.length}</div></GlassCard>
        <GlassCard tint="lavender" className="p-5"><div className="text-xs uppercase">Quizzes / Problems</div><div className="text-3xl font-black">{quizzes}/{problems}</div></GlassCard>
      </div>
      <div className="mt-6 flex gap-3 flex-wrap">
        <Button asChild><Link to="/admin/submissions">Analytics</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/coding">Coding submissions log</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/quizzes">Manage quizzes</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/problems">Manage problems</Link></Button>
        <Button asChild variant="secondary"><Link to="/admin/debugging">Manage debugging</Link></Button>
      </div>
    </Shell>
  );
}