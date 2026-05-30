import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { ToastProvider } from "@/shared/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WebPlatform — Build Beautiful Websites",
  description:
    "Create stunning websites visually with our drag-and-drop editor. No coding required.",
  keywords: ["website builder", "visual editor", "drag and drop", "no-code"],
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
