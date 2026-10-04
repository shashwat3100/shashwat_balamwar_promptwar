import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blind Spot | See what your thinking might be missing",
  description: "An AI-powered decision-thinking workspace that spots reasoning gaps, assumptions, and unexplored alternatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <main className="main-content" style={{ padding: "0" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
