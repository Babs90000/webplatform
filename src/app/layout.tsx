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
  title: "WebPlatform — Build Beautiful Websites",
  description:
    "Create stunning websites visually with our drag-and-drop editor. No coding required.",
  keywords: ["website builder", "visual editor", "drag and drop", "no-code"],
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
