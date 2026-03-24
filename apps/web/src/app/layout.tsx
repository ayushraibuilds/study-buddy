import type { Metadata } from "next";
import { IBM_Plex_Mono, Nunito_Sans, Sora } from "next/font/google";
import { rootVariablesCss } from "@study-buddy/design-tokens";
import "./globals.css";

const displayFont = Sora({
  variable: "--font-study-display",
  subsets: ["latin"],
});

const sansFont = Nunito_Sans({
  variable: "--font-study-body",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-study-mono",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Buddy",
  description:
    "Turn notes or PDFs into flashcards, MCQs, and revision summaries for competitive exams.",
  applicationName: "Study Buddy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <style>{rootVariablesCss}</style>
        {children}
      </body>
    </html>
  );
}
