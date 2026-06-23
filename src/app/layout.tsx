import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const fontDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Barbeiro em Seixezelo`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Barbearia tradicional em Seixezelo. Agende o seu corte, barba ou tratamento online em poucos minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}>
      <body className="dark flex min-h-full flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
