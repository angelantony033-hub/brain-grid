import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, GlassCard } from "@/components/Shell";
import { Guard } from "@/components/Guard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { BASE_URL } from "@/config/apiConfig";

export const Route = createFileRoute("/quizzes/$id")({ component: () => <Guard role="student"><QuizPlay /></Guard> });

type PlayQuestion = { id: string; text: string; options: string[]; marks: number };
type PlayQuiz = { id: string; title: string; topic: string; difficulty: string; timeLimit: number; questions: PlayQuestion[] };
type ReviewItem = { id: string; text: string; options: string[]; marks: number; correct: number; picked: number | null; isCorrect: boolean };

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function QuizPlay() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<PlayQuiz | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<{ score: number; total: number; review: ReviewItem[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/quizzes/${id}`, { headers: authHeaders(), cache: "no-store" });
        const data = await res.json();
        if (!res.ok) { setNotFound(true); return; }
        setQuiz(data);
        setTimeLeft(data.timeLimit * 60);
      } catch {
        toast.error("Could not reach server");
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!quiz || submitted || timeLeft === null) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s === null) return s;
        if (s <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, submitted]);

  if (notFound) return <Shell><div>Quiz not found or unavailable.</div></Shell>;
  if (!quiz) return <Shell><div className="text-sm text-muted-foreground">Loading quiz...</div></Shell>;

  async function handleSubmit() {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/quizzes/${id}/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || "Failed to submit"); return; }
      setSubmitted(data);
      toast.success(`Scored ${data.score}/${data.total}`);
    } catch {
      toast.error("Could not reach server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const answered = Object.keys(answers).length;
  const mm = Math.floor((timeLeft || 0) / 60).toString().padStart(2, "0");
  const ss = ((timeLeft || 0) % 60).toString().padStart(2, "0");

  if (submitted) {
    const pct = submitted.total === 0 ? 0 : Math.round((submitted.score / submitted.total) * 100);
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
          {submitted.review.map((q, i) => (
            <GlassCard key={q.id} tint="plain" className={`p-4 border-l-4 ${q.isCorrect ? "border-emerald-400" : "border-rose-400"}`}>
              <div className="text-xs text-muted-foreground">Q{i + 1} · {q.marks} marks · {q.isCorrect ? `+${q.marks}` : "0"} earned</div>
              <div className="font-medium mt-1">{q.text}</div>
              <div className="text-sm mt-2">
                Your answer: <span className={q.isCorrect ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                  {q.picked === null ? "(unanswered)" : q.options[q.picked]}
                </span>
              </div>
              {!q.isCorrect && (
                <div className="text-sm mt-1">Correct answer: <span className="text-emerald-700 font-semibold">{q.options[q.correct]}</span></div>
              )}
            </GlassCard>
          ))}
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
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
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