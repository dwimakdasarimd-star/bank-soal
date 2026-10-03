"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Activity, BookOpen, Calculator, ChevronRight, ClipboardCheck, HeartPulse, Hospital, Pill, ShieldCheck, Stethoscope, Syringe } from "lucide-react";

const tools = [
  { icon: Calculator, title: "Clinical Tools", text: "Kalkulator klinis untuk membantu proses belajar dan praktik." },
  { icon: Pill, title: "Drug & Rx", text: "Referensi obat, dosis, dan prinsip prescribing." },
  { icon: Activity, title: "Emergency", text: "Algoritma dan clinical pearls untuk kondisi akut." },
  { icon: BookOpen, title: "Clinical Library", text: "Ringkasan topik klinis yang praktis dan evidence-based." },
];

const cases = [
  { tag: "EMERGENCY", title: "Nyeri dada akut", meta: "Acute coronary syndrome · Clinical reasoning", icon: HeartPulse },
  { tag: "PRIMARY CARE", title: "Hipertensi tidak terkontrol", meta: "Assessment · Treatment · Follow-up", icon: Stethoscope },
  { tag: "PEDIATRICS", title: "Demam pada anak", meta: "Red flags · Dehydration · Referral", icon: Syringe },
];

export default function Home() {
  const router = useRouter();
  const go = (path: string) => router.push(path);

  return (
    <>
      <header className="djTop">
        <div className="djNavInner">
          <button className="djBrand" onClick={() => go("/")} aria-label="Dokter Jaga home">
            <span className="djLogo"><Stethoscope size={19} strokeWidth={2.5} /></span><span>Dokter Jaga</span>
          </button>
          <nav className="djNav"><button onClick={() => go("/bank-soal")}>Cases</button><button onClick={() => go("/quiz")}>Simulasi</button><button onClick={() => go("/pembahasan")}>Pembahasan</button><button onClick={() => go("/bank-soal")}>Tools</button></nav>
          <button className="djLogin" onClick={() => go("/bank-soal")}>Mulai Belajar</button>
        </div>
      </header>

      <main>
        <section className="djHero">
          <div className="djHeroGlow glowOne" /><div className="djHeroGlow glowTwo" />
          <div className="djHeroInner">
            <div className="djEyebrow"><span className="pulseDot" /> Clinical education untuk dokter Indonesia</div>
            <h1>Lebih siap menghadapi<br /><span>kasus klinis.</span></h1>
            <p className="djLead">Belajar, berpikir, dan berlatih menghadapi kasus sehari-hari melalui clinical cases, emergency resources, primary care, dan practical clinical tools.</p>
            <div className="djActions"><button className="djPrimary" onClick={() => go("/bank-soal")}>Mulai Clinical Cases <ArrowRight size={17} /></button><button className="djSecondary" onClick={() => go("/pembahasan")}>Lihat Pembahasan</button></div>
            <div className="djTrust"><ShieldCheck size={15} /> Dibuat untuk pembelajaran klinis · Berbasis referensi · Bahasa Indonesia</div>
          </div>
        </section>

        <section className="djSection djAudience">
          <div className="djSectionHead"><div><span className="djKicker">UNTUK PERJALANAN KLINIS ANDA</span><h2>Dari belajar sampai praktik.</h2></div><p>Satu ruang untuk memperkuat clinical reasoning, kesiapan menghadapi pasien, dan pembelajaran berkelanjutan.</p></div>
          <div className="djAudienceGrid">
            <button className="djAudienceCard" onClick={() => go("/bank-soal")}><div className="audIcon"><BookOpen size={20} /></div><div><h3>Mahasiswa & Koas</h3><p>Clinical cases, OSCE, dan latihan soal.</p></div><ChevronRight /></button>
            <button className="djAudienceCard featured" onClick={() => go("/bank-soal")}><div className="audIcon"><Hospital size={20} /></div><div><h3>Dokter Umum & Primary Care</h3><p>Practical resources untuk kasus sehari-hari.</p></div><ChevronRight /></button>
            <button className="djAudienceCard" onClick={() => go("/quiz")}><div className="audIcon"><ClipboardCheck size={20} /></div><div><h3>Persiapan Ujian</h3><p>Simulasi CBT dan pembahasan terstruktur.</p></div><ChevronRight /></button>
          </div>
        </section>

        <section className="djSection djCases">
          <div className="djSectionHead compact"><div><span className="djKicker">PRACTICE</span><h2>Clinical Cases</h2></div><button className="djTextLink" onClick={() => go("/bank-soal")}>Lihat semua <ArrowRight size={15} /></button></div>
          <div className="djCaseGrid">{cases.map(({ icon: Icon, ...item }) => <button className="djCaseCard" key={item.title} onClick={() => go("/bank-soal")}><div className="caseTop"><span>{item.tag}</span><Icon size={18} /></div><h3>{item.title}</h3><p>{item.meta}</p><div className="caseBottom">Mulai kasus <ArrowRight size={15} /></div></button>)}</div>
        </section>

        <section className="djSection djTools">
          <div className="djSectionHead compact"><div><span className="djKicker">PRACTICAL RESOURCES</span><h2>Yang Anda butuhkan saat belajar dan praktik.</h2></div></div>
          <div className="djToolGrid">{tools.map(({ icon: Icon, ...tool }) => <button className="djToolCard" key={tool.title} onClick={() => go("/bank-soal")}><span><Icon size={19} /></span><div><h3>{tool.title}</h3><p>{tool.text}</p></div><ArrowRight size={16} /></button>)}</div>
        </section>

        <section className="djCta"><div><span className="djKicker">DOKTER JAGA</span><h2>Mulai dari satu kasus hari ini.</h2><p>Bangun clinical reasoning sedikit demi sedikit, sampai Anda lebih siap menghadapi pasien berikutnya.</p></div><button className="djPrimary light" onClick={() => go("/bank-soal")}>Mulai Sekarang <ArrowRight size={17} /></button></section>
      </main>

      <footer className="djFooter"><div><strong>Dokter Jaga</strong><span>Clinical education & practical resources untuk dokter Indonesia.</span></div><span>© 2026 Dokter Jaga</span></footer>
    </>
  );
}
