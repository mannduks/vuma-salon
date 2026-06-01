import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";

import "@/app/globals.css";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "VUMA Salon",
  description: "Local-first salon and barbershop management for South African private beta teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          manrope.variable,
          playfair.variable,
          "font-sans text-foreground"
        )}
      >
        {children}
      </body>
    </html>
  );
}
