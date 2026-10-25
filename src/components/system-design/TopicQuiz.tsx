"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
import { QuizItem } from "@/lib/system-design/schema";

interface TopicQuizProps {
  quiz: QuizItem[];
  topicSlug: string;
}

export default function TopicQuiz({ quiz, topicSlug }: TopicQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!quiz || quiz.length === 0) return null;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    try {
      const score = calculateScore();
      const existing = JSON.parse(localStorage.getItem("system_design_quiz_scores") || "{}");
      existing[topicSlug] = {
        score,
        total: quiz.length,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("system_design_quiz_scores", JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save quiz score to localStorage", e);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const allAnswered = quiz.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <section className="my-12 rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold text-foreground">Knowledge Check</h3>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
          {quiz.length} Questions
        </span>
      </div>

      <div className="space-y-6">
        {quiz.map((item, qIdx) => {
          const userAnswer = selectedAnswers[qIdx];
          const isCorrect = userAnswer === item.answer;

          return (
            <div
              key={qIdx}
              className={`p-5 rounded-2xl border transition-all ${
                submitted
                  ? isCorrect
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-red-500/40 bg-red-500/5"
                  : "border-border/70 bg-background/50 hover:border-border"
              }`}
            >
              <p className="font-semibold text-foreground text-base mb-4">
                <span className="text-accent font-mono mr-2">{qIdx + 1}.</span>
                {item.question}
              </p>

              <div className="space-y-2">
                {item.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isRightChoice = item.answer === optIdx;

                  let optClass = "border-border/70 hover:bg-muted/60 text-foreground";
                  if (isSelected && !submitted) {
                    optClass = "border-accent bg-accent/10 text-accent font-medium";
                  } else if (submitted) {
                    if (isRightChoice) {
                      optClass = "border-green-500 bg-green-500/15 text-green-700 dark:text-green-300 font-semibold";
                    } else if (isSelected) {
                      optClass = "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300";
                    } else {
                      optClass = "border-border/40 text-foreground-secondary opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <span>{opt}</span>
                      {submitted && isRightChoice && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      {submitted && isSelected && !isRightChoice && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-4 pt-3 border-t border-border/40 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                  <span className="font-semibold text-foreground mr-1">Explanation:</span>
                  {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {submitted ? (
          <>
            <div className="text-sm font-semibold text-foreground">
              Your Score: <span className="text-accent text-lg">{score}</span> / {quiz.length}{" "}
              ({Math.round((score / quiz.length) * 100)}%)
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-foreground-secondary">
              Select an answer for each question to see your score and explanations.
            </p>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                allAnswered
                  ? "bg-accent text-white hover:opacity-90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <span>Submit Answers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
