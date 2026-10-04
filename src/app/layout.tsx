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
          <header style={{ borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', boxShadow: 'var(--shadow-glow)' }}></div>
                BLIND SPOT
              </div>
              <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>Workspace</span>
                <span>History</span>
              </nav>
            </div>
          </header>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
