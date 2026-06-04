import type { Metadata } from "next";
import "@/app/globals.css";
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
      <body className="font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
