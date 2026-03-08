import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRDS - Employee Training & Development System",
  description: "Enterprise-grade Employee Training Assignment System for managing training programs, certifications, and professional development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
