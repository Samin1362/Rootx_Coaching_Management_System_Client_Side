import React from "react";
import { Outlet } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

const PublicLayout = () => {
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", overflowX: "hidden" }}>
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
