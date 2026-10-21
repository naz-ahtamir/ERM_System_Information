import type { Metadata } from "next";
import "./globals.css";
import { PublicLayout } from "@/app/components/PublicLayout";
import { Providers } from "@/app/providers";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#1F2937] font-montserrat overflow-x-hidden selection:bg-[#FFF1E8] selection:text-[#FF6B1A]">
        <Providers>
          <PublicLayout>{children}</PublicLayout>
        </Providers>
      </body>
    </html>
  );
}
