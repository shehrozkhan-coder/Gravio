import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/components/InitUser";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Grovia | Fresh Groceries Delivered in Minutes",
  description:
    "Grovia delivers farm-fresh groceries, daily essentials, and household items to your doorstep in minutes. Fast, reliable, and hassle-free shopping experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[radial-gradient(circle_at_top,#ffffff,#d1fae5)]">
        <Provider>
          <StoreProvider>
            <InitUser />
            <div className="min-h-screen pb-20">{children}</div>
            <BottomNav />
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
