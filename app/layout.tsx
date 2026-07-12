import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const barlowCondensed = localFont({
  src: [
    { path: "./fonts/BarlowCondensed-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/BarlowCondensed-Black.ttf", weight: "900", style: "normal" },
    { path: "./fonts/BarlowCondensed-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-barlow-condensed",
});

const barlow = localFont({
  src: [
    { path: "./fonts/Barlow-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Barlow-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Barlow-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "PürInstinct — 60-Day Blueprint",
  description:
    "Seed CAD $750K · PürInstinct Games + INSTINCT in parallel. Roadmap, milestones, checkpoints and task ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${barlowCondensed.variable} ${barlow.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
