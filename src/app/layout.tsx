import type { Metadata } from "next";
import { Lora } from "next/font/google";
import Providers from "@/components/Providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import "./globals.css";

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCI",
  description: "Compra reportes mensuales de forma fácil y rápida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={lora.className} suppressHydrationWarning={true}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
