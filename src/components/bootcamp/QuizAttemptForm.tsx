'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Send, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CurriculumItem = Record<string, unknown>;

type Question = {
  text: string;
  type: string;
  options: string[];
};

function questionsFor(item: CurriculumItem): Question[] {
  const quiz = item.quiz_data;
  if (!quiz || typeof quiz !== 'object' || Array.isArray(quiz)) return [];
  const rawQuestions = (quiz as Record<string, unknown>).questions;
  if (!Array.isArray(rawQuestions)) return [];
  return rawQuestions.flatMap((rawQuestion) => {
    if (!rawQuestion || typeof rawQuestion !== 'object' || Array.isArray(rawQuestion)) return [];
    const question = rawQuestion as Record<string, unknown>;
    const options = Array.isArray(question.options)
      ? question.options.filter((option): option is string => typeof option === 'string').slice(0, 20)
      : [];
    const text = typeof question.text === 'string' ? question.text : '';
    if (!text) return [];
    return [{ text, type: typeof question.type === 'string' ? question.type : 'mc', options }];
  });
}

export function QuizAttemptForm({
  workspaceId,
  curriculum,
  completedCurriculumIds,
}: {
  workspaceId: string;
  curriculum: CurriculumItem[];
  completedCurriculumIds: string[];
}) {
  const router = useRouter();
  const quizzes = useMemo(
    () => curriculum.filter((item) => item.type === 'post_test' && questionsFor(item).length > 0),
    [curriculum],
  );
  const completed = useMemo(() => new Set(completedCurriculumIds), [completedCurriculumIds]);
  const [activeId, setActiveId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const active = quizzes.find((item) => String(item.id) === activeId) ?? null;
  const questions = active ? questionsFor(active) : [];
  const answered = questions.filter((_, index) => {
    const value = answers[String(index)];
    return value !== undefined && String(value).trim() !== '';
  }).length;
  const canSubmit = questions.length > 0 && answered === questions.length && !submitting;

  if (quizzes.length === 0) return null;

  function start(item: CurriculumItem) {
    setActiveId(String(item.id));
    setAnswers({});
    setError(null);
    setMessage(null);
  }

  function close() {
    setActiveId('');
    setAnswers({});
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/quiz-results', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, curriculumId: String(active.id), answers }),
      });
      const payload = await response.json() as { success?: boolean; score?: number; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Quiz tidak dapat dikumpulkan.');
      setMessage(`Quiz tersimpan. Nilai Anda ${payload.score ?? 0}/100.`);
      close();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Quiz tidak dapat dikumpulkan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div><p className="rc-eyebrow">Post-test</p><h2 className="mt-1 font-extrabold text-slate-950">Kerjakan quiz</h2><p className="mt-1 text-sm leading-6 text-slate-500">Satu percobaan per quiz. Nilai dihitung server dari kunci jawaban yang tersimpan.</p></div>
        <span className="rc-stat-icon bg-indigo-50 text-indigo-700"><ShieldCheck size={19} aria-hidden="true" /></span>
      </div>
      {message && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {!active ? (
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {quizzes.map((item) => {
            const id = String(item.id);
            const isCompleted = completed.has(id);
            return <article key={id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{String(item.title ?? 'Post-test')}</p><p className="mt-1 text-xs text-slate-500">{questionsFor(item).length} pertanyaan</p></div>{isCompleted ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800"><CheckCircle2 size={14} aria-hidden="true" /> Selesai</span> : <button type="button" onClick={() => start(item)} className="rc-button rc-button-secondary shrink-0"><ClipboardCheck size={16} aria-hidden="true" /> Mulai</button>}</article>;
          })}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="font-extrabold text-slate-900">{String(active.title ?? 'Post-test')}</p><p className="mt-1 text-xs font-semibold text-slate-500">Terjawab {answered}/{questions.length}</p></div>
          {questions.map((question, index) => {
            const isMultipleChoice = (question.type === 'mc' || question.type === 'multiple_choice') && question.options.length > 0;
            return <fieldset key={`${activeId}-${index}`} className="rounded-2xl border border-slate-200 p-4 sm:p-5"><legend className="max-w-full px-1 text-sm font-extrabold leading-6 text-slate-900">{index + 1}. {question.text}</legend>{isMultipleChoice ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={`${index}-${optionIndex}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${answers[String(index)] === optionIndex ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:border-teal-300'}`}><input className="h-4 w-4 accent-teal-700" type="radio" name={`question-${index}`} value={optionIndex} checked={answers[String(index)] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [String(index)]: optionIndex }))} />{option}</label>)}</div> : <textarea required value={typeof answers[String(index)] === 'string' ? answers[String(index)] : ''} onChange={(event) => setAnswers((current) => ({ ...current, [String(index)]: event.target.value }))} rows={3} maxLength={10000} className="rc-field mt-3 min-h-24 w-full resize-y" placeholder="Tulis jawaban Anda." />}</fieldset>;
          })}
          <div className="flex flex-wrap gap-3"><button type="button" onClick={close} className="rc-button rc-button-secondary">Batal</button><button type="submit" className="rc-button rc-button-primary" disabled={!canSubmit}>{submitting ? 'Mengirim…' : <><Send size={16} aria-hidden="true" />Kirim jawaban</>}</button></div>
        </form>
      )}
    </section>
  );
}
