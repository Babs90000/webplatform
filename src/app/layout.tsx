import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ToastProvider } from "@/shared/components/Toast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "WebPlatform — Créez votre site avec l'IA",
  description:
    "Brief guidé, génération HTML/CSS/JS en streaming et export ZIP — propulsé par Koala Codeur.",
  keywords: ["website builder", "IA", "génération de code", "no-code", "Koala Codeur"],
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${jetbrainsMono.variable}`}
    >
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
