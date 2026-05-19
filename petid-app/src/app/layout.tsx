import type { Metadata } from "next"
import { Lora, DM_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "PetID — Identificación digital para tu mascota",
  description: "Crea el perfil digital de tu mascota, genera un QR y permite que quien la encuentre contacte al dueño.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${dmSans.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
