import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaki Harmoni | Your 15-Minute Daily Reset",
  description:
    "A warm 15-minute leg soak and a good coffee at Desa Cindaimas Condominium Clubhouse, Kuala Lumpur — short enough to fit into every day. Try your first soak for RM25; first visits from 11 September 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        {children}
      </body>
    </html>
  );
}
