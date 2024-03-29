import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { MyContextProvider } from "./components/context";
import Navbar from "./layoutComponents/navbar";
import background from "./../const/Background.png";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lucky Cats",
  description: "Generated by Ollie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="background-container"></div>
        <MyContextProvider>
          <Navbar />
          {children}
        </MyContextProvider>
      </body>
    </html>
  );
}
