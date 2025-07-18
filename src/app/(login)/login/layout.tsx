import { ReactNode } from "react";
import { Toaster } from "sonner";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster position="top-right" />
      {/* <Header /> */}
      {children}
      {/* <Footer /> */}
    </>
  );
}
