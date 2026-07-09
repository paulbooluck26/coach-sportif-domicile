import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}