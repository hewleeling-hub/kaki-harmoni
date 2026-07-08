import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaki Harmoni — Sales Signups",
  description: "Kaki Harmoni foot spa & café — signup and purchase tracking",
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
