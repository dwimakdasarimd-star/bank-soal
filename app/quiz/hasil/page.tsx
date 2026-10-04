"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/allQuestions";

type ResultRow = {
  id: number;
  question: string;
  department: string;
  chosen?: number;
  answer: number;
  correct: boolean;
  blank: boolean;
  explanation: string;
};

export default function QuizResultPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [mode, setMode] = useState<"latihan" | "cbt">("latihan");
  const [activeFilter, setActiveFilter] = useState<"all" | "wrong" | "blank">("all");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const rawIds = sessionStorage.getItem("ukmppd_result_ids");
    const ids: number[] = rawIds ? JSON.parse(rawIds) : [];
    const rawAnswers = localStorage.getItem("ukmppd_answers");
    const answers: Record<string, number> = rawAnswers ? JSON.parse(rawAnswers) : {};
    const storedMode = sessionStorage.getItem("ukmppd_quiz_mode") === "cbt" ? "cbt" : "latihan";
    setMode(storedMode);

    const rawSession = sessionStorage.getItem("ukmppd_quiz_session");
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        const end = session.finishedAt || Date.now();
        setDuration(Math.max(0, Math.floor((end - session.startedAt) / 1000)));
      } catch {
        setDuration(0);
      }
    }

    const computed = ids.map((id) => {
      const q = questions.find((item) => item.id === id);
      if (!q) return null;
      const chosen = answers[String(id)];
      return {
        id,
        question: q.question,
        department: q.department,
        chosen,
        answer: q.answer,
        correct: chosen !== undefined && chosen === q.answer,
        blank: chosen === undefined,
        explanation: q.explanation,
      };
    }).filter(Boolean) as ResultRow[];
    setRows(computed);
  }, []);

  const correct = rows.filter((row) => row.correct).length;
  const blank = rows.filter((row) => row.blank).length;
  const wrong = rows.filter((row) => !row.correct && !row.blank).length;
  const score = rows.length ? Math.round((correct / rows.length) * 100) : 0;
  const accuracy = rows.length - blank ? Math.round((correct / (rows.length - blank)) * 100) : 0;
  const avgSeconds = rows.length && duration ? Math.round(duration / rows.length) : 0;
  const filtered = useMemo(() => {
    if (activeFilter === "wrong") return rows.filter((row) => !row.correct && !row.blank);
    if (activeFilter === "blank") return rows.filter((row) => row.blank);
    return rows;
  }, [rows, activeFilter]);

  const level = score >= 80 ? "Excellent" : score >= 65 ? "Strong" : score >= 50 ? "Developing" : "Needs Review";
  const departments = Array.from(new Set(rows.map((row) => row.department)));

  function formatDuration(total: number) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m ? `${m}m ${s}s` : `${s}s`;
  }

  return (
    <main className="resultV2Page">
      <section className="resultV2Hero">
        <button className="resultBack" onClick={() => router.push("/bank-soal")}>← Kembali ke bank soal</button>
        <div className="resultEyebrow">{mode === "cbt" ? "TRYOUT CBT SELESAI" : "LATIHAN SELESAI"}</div>
        <div className="scoreRing" style={{ background: `conic-gradient(#155eef ${score * 3.6}deg, #e6ecf5 ${score * 3.6}deg)` }}><div><strong>{score}</strong><span>/100</span></div></div>
        <h1>{level}</h1>
        <p>{correct} benar dari {rows.length} soal • {wrong} salah • {blank} kosong</p>
      </section>

      <section className="resultV2Body">
        <div className="metricGrid">
          <div className="resultMetric"><span>Skor</span><strong>{score}%</strong><small>Nilai akhir</small></div>
          <div className="resultMetric"><span>Akurasi terjawab</span><strong>{accuracy}%</strong><small>Tidak menghitung soal kosong</small></div>
          <div className="resultMetric"><span>Waktu</span><strong>{formatDuration(duration)}</strong><small>Rata-rata {avgSeconds}s/soal</small></div>
          <div className="resultMetric"><span>Departemen</span><strong>{departments.length}</strong><small>Area yang dikerjakan</small></div>
        </div>

        <div className="resultSectionHead">
          <div><span className="eyebrow">REVIEW</span><h2>Review jawaban</h2></div>
          <div className="resultFilters">
            <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>Semua {rows.length}</button>
            <button className={activeFilter === "wrong" ? "active" : ""} onClick={() => setActiveFilter("wrong")}>Salah {wrong}</button>
            <button className={activeFilter === "blank" ? "active" : ""} onClick={() => setActiveFilter("blank")}>Kosong {blank}</button>
          </div>
        </div>

        <div className="resultListV2">
          {filtered.map((row, idx) => (
            <article className={"resultReviewCard " + (row.correct ? "reviewCorrect" : row.blank ? "reviewBlank" : "reviewWrong")} key={row.id}>
              <div className="resultReviewTop">
                <span>Soal {idx + 1}</span>
                <b>{row.blank ? "KOSONG" : row.correct ? "BENAR" : "SALAH"}</b>
              </div>
              <h3>{row.question}</h3>
              <div className="answerCompare">
                <div><span>Jawaban Anda</span><strong>{row.blank ? "Tidak dijawab" : String.fromCharCode(65 + row.chosen!)}</strong></div>
                <div><span>Kunci</span><strong>{String.fromCharCode(65 + row.answer)}</strong></div>
              </div>
              <p>{row.explanation}</p>
            </article>
          ))}
        </div>

        <div className="resultActionsV2">
          <button className="resultPrimary" onClick={() => {
            localStorage.removeItem("ukmppd_answers");
            localStorage.removeItem("ukmppd_quiz_flags");
            sessionStorage.removeItem("ukmppd_quiz_session");
            router.push("/bank-soal");
          }}>Coba Tryout Baru</button>
          <button className="resultSecondary" onClick={() => router.push("/pembahasan")}>Buka Pembahasan</button>
        </div>
      </section>
    </main>
  );
}
