import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import Logo from "./Logo";
import { FaBars, FaTimes, FaArrowRight } from "react-icons/fa";

const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Pricing",  href: "/plans" },
  { label: "Contact",  href: "/#contact" },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const isHashLink = (href) => href.startsWith("/#");

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const PublicNavbar = () => {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState(""); // '' | 'features' | 'contact'

  const navigate  = useNavigate();
  const location  = useLocation();

  const isHome  = location.pathname === "/";
  const isPlans = location.pathname === "/plans";

  /* ── Scroll detection: glass background on scroll ─── */
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  /* ── Close mobile menu on route change ───────────── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ── Section tracking via IntersectionObserver ────── *
   * Observes #features and #contact only while on "/".
   * When user scrolls back above both → activeSection = ''
   * so "Home" becomes active again.
   */
  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }

    const sectionIds = ["features", "contact"];
    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        });

        // Pick the topmost visible section (sections appear in DOM order)
        let found = "";
        for (const id of sectionIds) {
          if (visible.has(id)) { found = id; break; }
        }
        setActiveSection(found);
      },
      {
        threshold: 0.15,
        rootMargin: "-80px 0px -35% 0px", // offset for fixed navbar height
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome, location.pathname]);

  /* ── Active link resolver ─────────────────────────── */
  const isActive = (href) => {
    if (href === "/")          return isHome  && activeSection === "";
    if (href === "/plans")     return isPlans;
    if (href === "/#features") return isHome  && activeSection === "features";
    if (href === "/#contact")  return isHome  && activeSection === "contact";
    return false;
  };

  /* ── Nav click handler (hash + regular) ──────────── */
  const handleNavClick = (e, href) => {
    if (isHashLink(href)) {
      e.preventDefault();
      const id = href.slice(2);
      setMenuOpen(false);
      if (!isHome) {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 130);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setMenuOpen(false);
    }
  };

  /* ─────────────────────────────────────────────────── */
  return (
    <>
      {/* ══ Navbar bar ══════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(10, 18, 32, 0.94)"
            : "rgba(10, 18, 32, 0.55)",
          backdropFilter:       "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: scrolled
            ? "1px solid rgba(245,146,61,0.18)"
            : "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.45)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo dark />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="relative flex flex-col items-center px-4 py-2 text-sm rounded-lg
                               transition-colors duration-200 group"
                    style={{
                      color:      active ? "#f5923d" : "rgba(255,255,255,0.68)",
                      fontWeight: active ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.68)";
                    }}
                  >
                    {link.label}

                    {/* Active bar — persistent */}
                    {active && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                        style={{
                          width: "60%",
                          background: "linear-gradient(to right, #f5923d, #ff6b6b)",
                          boxShadow: "0 0 6px rgba(245,146,61,0.7)",
                        }}
                      />
                    )}

                    {/* Hover bar — only visible when NOT active */}
                    {!active && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0
                                   group-hover:w-[60%] rounded-full transition-all duration-300"
                        style={{
                          background: "linear-gradient(to right, #f5923d, #ff6b6b)",
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color:        "rgba(255,255,255,0.78)",
                  border:       "1px solid rgba(255,255,255,0.14)",
                  background:   "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color       = "#f5923d";
                  e.currentTarget.style.borderColor = "rgba(245,146,61,0.5)";
                  e.currentTarget.style.background  = "rgba(245,146,61,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color       = "rgba(255,255,255,0.78)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.background  = "transparent";
                }}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="btn-shine flex items-center gap-2 px-5 py-2 text-sm font-semibold
                           rounded-lg transition-all duration-200"
                style={{
                  background:  "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
                  color:       "#fff",
                  boxShadow:   "0 4px 14px rgba(245,146,61,0.38)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 22px rgba(245,146,61,0.58)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,146,61,0.38)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Get Started
                <FaArrowRight className="text-[11px]" />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg transition-all duration-200"
              style={{
                color:  "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <FaTimes className="text-base" />
                : <FaBars  className="text-base" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ══ Mobile menu overlay ═════════════════════════ */}
      <div
        className="fixed inset-0 z-40 lg:hidden"
        style={{
          opacity:       menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          visibility:    menuOpen ? "visible" : "hidden",
          transition:    "opacity 0.25s ease, visibility 0.25s ease",
        }}
      >
        {/* Dimmed backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setMenuOpen(false)}
        />

        {/* Slide-down panel */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            background:   "rgba(10, 18, 32, 0.98)",
            borderBottom: "1px solid rgba(245,146,61,0.18)",
            paddingTop:   "4.25rem",
            transform:    menuOpen ? "translateY(0)" : "translateY(-100%)",
            transition:   "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="px-5 py-5 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl
                             text-[0.9375rem] font-medium transition-all duration-200"
                  style={{
                    color:      active ? "#f5923d" : "rgba(255,255,255,0.78)",
                    background: active ? "rgba(245,146,61,0.08)" : "transparent",
                    borderLeft: active
                      ? "3px solid #f5923d"
                      : "3px solid transparent",
                    fontWeight: active ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background  = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color        = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color       = "rgba(255,255,255,0.78)";
                    }
                  }}
                >
                  <span>{link.label}</span>
                  <FaArrowRight
                    className="text-[10px]"
                    style={{ color: active ? "#f5923d" : "rgba(255,255,255,0.25)" }}
                  />
                </a>
              );
            })}

            {/* Auth buttons */}
            <div
              className="flex flex-col gap-2.5 mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-medium
                           transition-all duration-200"
                style={{
                  color:  "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.13)",
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="btn-shine w-full text-center py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
                  color:      "#fff",
                  boxShadow:  "0 4px 14px rgba(245,146,61,0.35)",
                }}
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNavbar;
