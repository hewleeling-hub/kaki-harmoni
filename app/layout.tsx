import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaki Harmoni — Foot Hydrotherapy & Coffee · Opening early August",
  description:
    "A warm foot hydrotherapy soak paired with good coffee at Desa Cindaimas Condominium Clubhouse. Opening early August — reserve your first visit and lock the launch price.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        {children}
      </body>
    </html>
  );
}
