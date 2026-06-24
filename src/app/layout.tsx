import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "theGriot.io",
  description: "Premium short-form content platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: adSettings } = await supabase.from('ad_settings').select('*').limit(1).single();
  const { data: customCode } = await supabase.from('custom_code').select('*').limit(1).single();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3613443586866640"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {customCode?.header_code && (
          <div dangerouslySetInnerHTML={{ __html: customCode.header_code }} />
        )}
      </head>
      <body>
        {customCode?.body_top_code && (
          <div dangerouslySetInnerHTML={{ __html: customCode.body_top_code }} />
        )}
        <AuthProvider>
          {children}
          <Toaster theme="dark" position="bottom-center" />
        </AuthProvider>
        {customCode?.footer_code && (
          <div dangerouslySetInnerHTML={{ __html: customCode.footer_code }} />
        )}
      </body>
    </html>
  );
}
