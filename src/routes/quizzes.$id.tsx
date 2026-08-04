import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { store, uid } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/quizzes/$id")({ component: () => <Guard role="student"><QuizPlay /></Guard> });

function QuizPlay() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const router = useRouter();
  const quiz = useMemo(() => store.getQuizzes().find((q) => q.id === id), [id]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState((quiz?.timeLimit || 5) * 60);
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    if (!quiz || submitted) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, submitted]);

  if (!quiz) return <Shell><div>Quiz not found.</div></Shell>;
  if (quiz.isHidden) return (
    <Shell>
      <GlassCard tint="plain" className="p-8 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold">Quiz unavailable</h1>
        <p className="text-sm text-muted-foreground mt-2">This quiz is currently hidden by the administrator.</p>
        <Button className="mt-4" onClick={() => router.navigate({ to: "/quizzes" })}>Back to quizzes</Button>
      </GlassCard>
    </Shell>
  );

  const total = quiz.questions.reduce((a, b) => a + b.marks, 0);

  function handleSubmit() {
    if (submitted) return;
    let score = 0;
    quiz!.questions.forEach((q) => { if (answers[q.id] === q.correct) score += q.marks; });
    const results = store.getQuizResults();
    results.push({
      id: uid(), quizId: quiz!.id, studentId: user!.id,
      score, total, timestamp: Date.now(),
      answers, status: "Reviewed", finalScore: score,
    });
    store.setQuizResults(results);
    setSubmitted({ score, total });
    toast.success(`Scored ${score}/${total}`);
  }

  const answered = Object.keys(answers).length;
  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  if (submitted) {
    const pct = total === 0 ? 0 : Math.round((submitted.score / total) * 100);
    return (
      <Shell>
        <GlassCard tint="mint" className="p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Quiz submitted 🎉</h1>
          <div className="mt-4 text-5xl font-black">{submitted.score}<span className="text-2xl text-muted-foreground">/{submitted.total}</span></div>
          <div className="text-sm text-muted-foreground mt-1">{pct}% · Auto-Graded</div>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={() => router.navigate({ to: "/quizzes" })}>More quizzes</Button>
            <Button variant="secondary" asChild><Link to="/submissions">My submissions</Link></Button>
          </div>
        </GlassCard>

        <div className="mt-6 space-y-3 max-w-2xl mx-auto">
          <div className="text-sm font-semibold text-muted-foreground uppercase">Answer review</div>
          {quiz.questions.map((q, i) => {
            const picked = answers[q.id];
            const correct = picked === q.correct;
            return (
              <GlassCard key={q.id} tint="plain" className={`p-4 border-l-4 ${correct ? "border-emerald-400" : "border-rose-400"}`}>
                <div className="text-xs text-muted-foreground">Q{i + 1} · {q.marks} marks · {correct ? `+${q.marks}` : "0"} earned</div>
                <div className="font-medium mt-1">{q.text}</div>
                <div className="text-sm mt-2">
                  Your answer: <span className={correct ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                    {picked === undefined ? "(unanswered)" : q.options[picked]}
                  </span>
                </div>
                {!correct && (
                  <div className="text-sm mt-1">Correct answer: <span className="text-emerald-700 font-semibold">{q.options[q.correct]}</span></div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="text-xs text-muted-foreground">{quiz.topic} · {quiz.difficulty}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/80 font-mono text-lg tabular-nums">{mm}:{ss}</div>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
      <div className="mt-3"><Progress value={(answered / quiz.questions.length) * 100} /></div>

      <div className="mt-6 space-y-4">
        {quiz.questions.map((q, i) => (
          <GlassCard key={q.id} tint="plain" className="p-6">
            <div className="text-xs text-muted-foreground">Question {i + 1} · {q.marks} marks</div>
            <div className="font-medium mt-1">{q.text}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${selected ? "bg-foreground text-background border-foreground" : "bg-white/70 border-white hover:bg-white"}`}
                  >
                    <span className="text-xs opacity-70 mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>
    </Shell>
  );
}