import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Bank Soal UKMPPD", description: "Platform latihan soal UKMPPD" };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="id"><body>{children}</body></html>; }