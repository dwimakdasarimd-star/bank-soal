"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/allQuestions";

type Answers = Record<string, number>;
type Flags = Record<string, boolean>;
type Session = {
  ids: number[];
  mode: "latihan" | "cbt";
  startedAt: number;
  duration: number;
};

const ANSWERS_KEY = "ukmppd_answers";
const FLAGS_KEY = "ukmppd_quiz_flags";
const SESSION_KEY = "ukmppd_quiz_session";

export default function QuizPage() {
  const router = useRouter();
  const [ids, setIds] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [flags, setFlags] = useState<Flags>({});
  const [mode, setMode] = useState<"latihan" | "cbt">("latihan");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mounted, setMounted] = useState(false);

  const quiz = useMemo(
    () => ids.map((id) => questions.find((q) => q.id === id)).filter(Boolean) as typeof questions,
    [ids]
  );
  const q = quiz[index];

  const persistSession = useCallback(
    (nextAnswers = answers, nextFlags = flags) => {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(nextAnswers));
      localStorage.setItem(FLAGS_KEY, JSON.stringify(nextFlags));
      sessionStorage.setItem("ukmppd_result_ids", JSON.stringify(ids));
    },
    [answers, flags, ids]
  );

  useEffect(() => {
    setMounted(true);
    const rawIds = sessionStorage.getItem("ukmppd_quiz_ids");
    const parsedIds: number[] = rawIds ? JSON.parse(rawIds) : questions.slice(0, 20).map((x) => x.id);
    const storedMode = sessionStorage.getItem("ukmppd_quiz_mode") === "cbt" ? "cbt" : "latihan";
    const rawAnswers = localStorage.getItem(ANSWERS_KEY);
    const rawFlags = localStorage.getItem(FLAGS_KEY);
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    const storedAnswers = rawAnswers ? JSON.parse(rawAnswers) : {};
    const storedFlags = rawFlags ? JSON.parse(rawFlags) : {};

    setIds(parsedIds);
    setMode(storedMode);
    setAnswers(storedAnswers);
    setFlags(storedFlags);

    let session: Session | null = null;
    try {
      session = rawSession ? JSON.parse(rawSession) : null;
    } catch {
      session = null;
    }

    const expectedDuration = storedMode === "cbt" ? parsedIds.length * 120 : 0;
    if (!session || session.ids.join(",") !== parsedIds.join(",") || session.mode !== storedMode) {
      const fresh: Session = {
        ids: parsedIds,
        mode: storedMode,
        startedAt: Date.now(),
        duration: expectedDuration,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      setSecondsLeft(expectedDuration);
    } else if (storedMode === "cbt") {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      setSecondsLeft(Math.max(0, session.duration - elapsed));
    }
  }, []);

  useEffect(() => {
    if (!mounted || mode !== "cbt" || !ids.length) return;
    if (secondsLeft <= 0) {
      router.push("/quiz/hasil");
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          router.push("/quiz/hasil");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mounted, mode, ids.length, secondsLeft, router]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!q || showFinish) return;
      if (event.key >= "1" && event.key <= "5") {
        const choice = Number(event.key) - 1;
        if (choice < q.options.length) {
          event.preventDefault();
          choose(choice);
        }
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleFlag();
      }
      if (event.key === "?") {
        event.preventDefault();
        setShowShortcuts((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!mounted || !q) {
    return (
      <main className="quizV2Page">
        <div className="quizLoading">
          <div className="loadingPulse" />
          <strong>Menyiapkan tryout...</strong>
          <span>Memuat soal dan sesi ujian.</span>
        </div>
      </main>
    );
  }

  const selected = answers[String(q.id)];
  const flagged = !!flags[String(q.id)];
  const answeredCount = Object.keys(answers).filter((id) => ids.includes(Number(id))).length;
  const flaggedCount = Object.keys(flags).filter((id) => flags[id] && ids.includes(Number(id))).length;
  const progress = Math.round(((index + 1) / quiz.length) * 100);
  const unansweredCount = quiz.length - answeredCount;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timePercent =
    mode === "cbt" ? Math.max(0, Math.min(100, (secondsLeft / Math.max(1, quiz.length * 120)) * 100)) : 100;

  function choose(choice: number) {
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    persistSession(next, flags);
  }

  function toggleFlag() {
    const next = { ...flags, [q.id]: !flags[String(q.id)] };
    setFlags(next);
    persistSession(answers, next);
  }

  function goNext() {
    if (index < quiz.length - 1) setIndex((value) => value + 1);
    else if (mode === "cbt") setShowFinish(true);
    else router.push("/quiz/hasil");
  }

  function goPrevious() {
    if (index > 0) setIndex((value) => value - 1);
  }

  function finishQuiz() {
    persistSession();
    const resultSession = sessionStorage.getItem(SESSION_KEY);
    if (resultSession) {
      try {
        const session: Session = JSON.parse(resultSession);
        const updated = { ...session, finishedAt: Date.now() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {
        // Keep the session intact if parsing fails.
      }
    }
    router.push("/quiz/hasil");
  }

  return (
    <main className="quizV2Page">
      <header className="quizV2Header">
        <div className="quizBrand">
          <button className="iconBtn" onClick={() => router.push("/bank-soal")} aria-label="Kembali">
            ←
          </button>
          <div>
            <div className="quizBrandTitle">{mode === "cbt" ? "TRYOUT CBT" : "LATIHAN ADAPTIF"}</div>
            <div className="quizBrandMeta">{quiz.length} soal • {q.department}</div>
          </div>
        </div>

        <div className="quizHeaderRight">
          <div className="headerStat"><span>Terjawab</span><b>{answeredCount}/{quiz.length}</b></div>
          <div className="headerStat flaggedStat"><span>Ragu</span><b>{flaggedCount}</b></div>
          {mode === "cbt" && (
            <div className={"timerBox " + (secondsLeft <= 120 ? "timerDanger" : "")}>
              <span>Waktu</span><strong>{mm}:{ss}</strong>
            </div>
          )}
          <button className="sheetBtn" onClick={() => setShowSheet(true)}>☷ Daftar Soal</button>
        </div>
      </header>

      <div className="quizProgressShell">
        <div className="quizProgressTrack"><span style={{ width: `${progress}%` }} /></div>
        <div className="quizProgressMeta">
          <span>Soal <b>{index + 1}</b> dari <b>{quiz.length}</b></span>
          <span>{progress}% selesai</span>
        </div>
        {mode === "cbt" && <div className="timeProgressTrack"><span style={{ width: `${timePercent}%` }} /></div>}
      </div>

      <section className="quizLayout">
        <div className="questionColumn">
          <div className="questionTopRow">
            <span className="questionNumber">QUESTION {String(index + 1).padStart(2, "0")}</span>
            <button className={"flagBtn " + (flagged ? "flagged" : "")} onClick={toggleFlag}>
              {flagged ? "★ Ditandai ragu" : "☆ Tandai ragu"}
            </button>
          </div>

          <div className="mobileQuickSheet">
            <div className="mobileSheetHead">
              <div><b>Nomor Soal</b><span>{answeredCount}/{quiz.length} terjawab</span></div>
              <button onClick={() => setShowSheet(true)}>Lihat semua</button>
            </div>
            <div className="mobileSheetGrid">
              {quiz.map((item, number) => {
                const hasAnswer = answers[String(item.id)] !== undefined;
                const isFlagged = !!flags[String(item.id)];
                return (
                  <button
                    key={item.id}
                    className={"mobileSheetNumber " + (number === index ? "current " : "") + (hasAnswer ? "answered " : "empty ") + (isFlagged ? "flagged " : "")}
                    onClick={() => setIndex(number)}
                    aria-label={`Lompat ke soal ${number + 1}`}
                  >
                    {number + 1}
                  </button>
                );
              })}
            </div>
            <div className="mobileSheetHint">Klik nomor mana saja untuk langsung lompat ke soal tersebut.</div>
          </div>

          <article className="questionCardV2">
            <div className="questionCategory">{q.department}</div>
            <h1>{q.question}</h1>

            {q.image && (
              <div className="questionImageV2">
                <img src={q.image} alt={`Ilustrasi soal ${index + 1}`} />
              </div>
            )}

            <div className="optionGridV2">
              {q.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex;
                const isCorrect = mode === "latihan" && selected !== undefined && optionIndex === q.answer;
                const isWrongSelected =
                  mode === "latihan" && isSelected && optionIndex !== q.answer;
                return (
                  <button
                    key={optionIndex}
                    className={"optionV2 " + (isSelected ? "selected" : "") + (isCorrect ? "correct" : "") + (isWrongSelected ? "wrong" : "")}
                    onClick={() => choose(optionIndex)}
                  >
                    <span className="optionKey">{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="optionText">{option}</span>
                    <span className="optionState">
                      {mode === "latihan" && selected !== undefined && isCorrect ? "✓" : isSelected ? "●" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {mode === "latihan" && selected !== undefined && (
              <div className={"feedbackBox " + (selected === q.answer ? "feedbackGood" : "feedbackBad")}>
                <strong>{selected === q.answer ? "✓ Jawaban benar" : "✕ Belum tepat"}</strong>
                <p>{q.explanation}</p>
                {q.optionExplanations && (
                  <details>
                    <summary>Lihat pembahasan tiap opsi</summary>
                    <div className="optionExplainList">
                      {q.options.map((option, optionIndex) => (
                        <div className={"optionExplain " + (optionIndex === q.answer ? "optionExplainKey" : "")} key={optionIndex}>
                          <b>{String.fromCharCode(65 + optionIndex)}. {option}</b>
                          <span>{q.optionExplanations?.[optionIndex] || q.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </article>

          <div className="quizBottomBar">
            <button className="navBtn ghost" disabled={index === 0} onClick={goPrevious}>← Sebelumnya</button>
            <div className="bottomCenter">
              <span>{selected === undefined ? "Belum dijawab" : "Jawaban tersimpan otomatis"}</span>
              <button className="shortcutBtn" onClick={() => setShowShortcuts(true)}>⌨ Shortcuts</button>
            </div>
            <button className="navBtn primary" onClick={goNext}>
              {index === quiz.length - 1 ? (mode === "cbt" ? "Review & Submit" : "Lihat Hasil") : "Berikutnya →"}
            </button>
          </div>
        </div>

        <aside className="quizSideCard">
          <div className="sideTitle"><span>Answer Sheet</span><b>{answeredCount}/{quiz.length}</b></div>
          <div className="sheetLegend">
            <span><i className="legendAnswered" /> Terjawab</span>
            <span><i className="legendFlagged" /> Ragu</span>
            <span><i className="legendEmpty" /> Kosong</span>
          </div>
          <div className="miniSheet">
            {quiz.map((item, number) => {
              const hasAnswer = answers[String(item.id)] !== undefined;
              const isFlagged = !!flags[String(item.id)];
              return (
                <button
                  key={item.id}
                  className={"miniNumber " + (number === index ? "current " : "") + (hasAnswer ? "answered " : "empty ") + (isFlagged ? "flagged " : "")}
                  onClick={() => setIndex(number)}
                >
                  {number + 1}
                </button>
              );
            })}
          </div>
          <button className="sheetFullBtn" onClick={() => setShowSheet(true)}>Buka answer sheet penuh →</button>
          <div className="sideSummary">
            <div><span>Belum dijawab</span><b>{unansweredCount}</b></div>
            <div><span>Ditandai ragu</span><b>{flaggedCount}</b></div>
          </div>
          {mode === "cbt" && <button className="finishSideBtn" onClick={() => setShowFinish(true)}>✓ Selesaikan Tryout</button>}
        </aside>
      </section>

      {showSheet && (
        <div className="modalBackdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSheet(false); }}>
          <div className="quizModal sheetModal">
            <div className="modalHeader">
              <div><span className="eyebrow">NAVIGASI</span><h2>Daftar Soal</h2></div>
              <button className="iconBtn" onClick={() => setShowSheet(false)}>×</button>
            </div>
            <div className="modalStats">
              <span>{answeredCount} terjawab</span><span>{unansweredCount} kosong</span><span>{flaggedCount} ragu</span>
            </div>
            <div className="modalSheetGrid">
              {quiz.map((item, number) => (
                <button
                  key={item.id}
                  className={"sheetCell " + (number === index ? "current " : "") + (answers[String(item.id)] !== undefined ? "answered " : "empty ") + (flags[String(item.id)] ? "flagged " : "")}
                  onClick={() => { setIndex(number); setShowSheet(false); }}
                >
                  <span>{number + 1}</span>
                  {flags[String(item.id)] && <small>★</small>}
                </button>
              ))}
            </div>
            <div className="modalActions">
              <button className="navBtn ghost" onClick={() => setShowSheet(false)}>Kembali ke Soal</button>
              <button className="navBtn primary" onClick={() => { setShowSheet(false); setShowFinish(true); }}>
                Review & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinish && (
        <div className="modalBackdrop">
          <div className="quizModal finishModal">
            <div className="finishIcon">✓</div>
            <span className="eyebrow">FINAL CHECK</span>
            <h2>Yakin ingin mengakhiri tryout?</h2>
            <p>Setelah dikirim, jawaban akan dinilai dan hasil performa akan ditampilkan.</p>
            <div className="finishStats">
              <div><strong>{answeredCount}</strong><span>Terjawab</span></div>
              <div><strong>{unansweredCount}</strong><span>Kosong</span></div>
              <div><strong>{flaggedCount}</strong><span>Ragu</span></div>
            </div>
            {unansweredCount > 0 && <div className="warningBox">Masih ada {unansweredCount} soal yang belum dijawab.</div>}
            <div className="modalActions">
              <button className="navBtn ghost" onClick={() => setShowFinish(false)}>Kembali</button>
              <button className="navBtn primary" onClick={finishQuiz}>Submit Tryout</button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="modalBackdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowShortcuts(false); }}>
          <div className="quizModal shortcutModal">
            <div className="modalHeader">
              <div><span className="eyebrow">KEYBOARD</span><h2>Shortcuts</h2></div>
              <button className="iconBtn" onClick={() => setShowShortcuts(false)}>×</button>
            </div>
            <div className="shortcutList">
              <div><kbd>1–5</kbd><span>Pilih jawaban</span></div>
              <div><kbd>← →</kbd><span>Pindah soal</span></div>
              <div><kbd>M</kbd><span>Tandai / hapus ragu</span></div>
              <div><kbd>?</kbd><span>Buka shortcut</span></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
