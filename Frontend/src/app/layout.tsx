import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { PublicLayout } from "@/app/components/PublicLayout";
import { Providers } from "@/app/providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Life Above All. No Safety No Work.",
  description: "Safety And Emergency Management Department - PT. QMB New Energy Materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#faf9f7] text-[#231f20] font-montserrat overflow-x-hidden">
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
