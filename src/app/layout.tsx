import type { Metadata } from "next";
import Providers from "@/components/Providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import "./globals.css";

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
      <body suppressHydrationWarning={true}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
