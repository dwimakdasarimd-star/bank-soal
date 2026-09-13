import type { Metadata } from "next";
import "./globals.css";
import "./dokter-jaga.css";
import InteractiveBackground from "../components/InteractiveBackground";

export const metadata: Metadata = {
  title: "Dokter Jaga | Clinical Education & Practical Resources",
  description: "Platform clinical education dan practical resources untuk dokter Indonesia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <InteractiveBackground />
        <div className="siteContent">{children}</div>
      </body>
    </html>
  );
}
