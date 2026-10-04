"use client";

export default function Home() {
  return (
    <main style={{ margin: 0, width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="/siap-ppds.html"
        title="Siap PPDS"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </main>
  );
}
