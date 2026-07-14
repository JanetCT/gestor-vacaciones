// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "LETS TRIP",
  description: "Sistema de Gestión de Vacaciones y Permisos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}