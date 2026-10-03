import fs from "node:fs";
import path from "node:path";

export default function Home() {
  const html = fs.readFileSync(path.join(process.cwd(), "public", "siap-ppds.html"), "utf8");
  return (
    <iframe
      title="Siap PPDS"
      srcDoc={html}
      style={{ width: "100%", height: "100vh", border: "0", display: "block" }}
    />
  );
}
