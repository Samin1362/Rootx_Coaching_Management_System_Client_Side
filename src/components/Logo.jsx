import React from "react";

/**
 * Logo component — used in both dark (PublicNavbar) and light (AuthLayout,
 * DashboardLayout) contexts.
 *
 * @param {boolean} dark   Pass `true` when rendering on a dark/hardcoded-navy background
 *                         (e.g. PublicNavbar). When false (default), text colours are driven
 *                         by DaisyUI's `text-base-content` so they adapt to theme toggling.
 */
const Logo = ({ dark = false }) => {
  return (
    <div className="group flex items-center gap-2.5 select-none cursor-pointer">

      {/* ── Icon box ─────────────────────────────────────── */}
      <div
        className="
          relative flex-shrink-0
          w-9 h-9 rounded-xl
          flex items-center justify-center
          overflow-hidden
          transition-all duration-300 ease-out
          group-hover:scale-[1.07]
        "
        style={{
          background: "linear-gradient(150deg, #f9a05a 0%, #f5923d 55%, #e57a1a 100%)",
          boxShadow: "0 2px 10px rgba(245,146,61,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
        /* Glow deepens on hover — applied via JS because inline box-shadow
           cannot be targeted by Tailwind group-hover directly */
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 6px 22px rgba(245,146,61,0.55), inset 0 1px 0 rgba(255,255,255,0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 2px 10px rgba(245,146,61,0.35), inset 0 1px 0 rgba(255,255,255,0.18)";
        }}
      >
        {/* Top gloss — gives the icon depth */}
        <div
          className="absolute top-0 inset-x-0 h-[45%] rounded-t-xl pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)" }}
        />

        {/* Lettermark R */}
        <span
          className="relative z-10 text-white font-black text-lg leading-none"
          style={{ letterSpacing: "-0.03em" }}
        >
          R
        </span>

        {/* Bottom accent line — subtle education/book motif */}
        <div
          className="absolute bottom-[7px] left-[8px] right-[8px] h-px rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.28)" }}
        />
      </div>

      {/* ── Brand text ───────────────────────────────────── */}
      <div className="flex flex-col leading-none gap-[4px]">

        {/* Wordmark */}
        <span
          className="text-[1.05rem] font-bold leading-none"
          style={{ letterSpacing: "-0.01em" }}
        >
          <span
            className={dark ? "" : "text-base-content"}
            style={dark ? { color: "#ffffff" } : {}}
          >
            Root
          </span>
          <span style={{ color: "#f5923d", fontWeight: 800 }}>X</span>
        </span>

        {/* Sub-label */}
        <span
          className={
            dark
              ? "text-[9px] uppercase font-semibold"
              : "text-[9px] uppercase font-semibold text-base-content/40"
          }
          style={{
            letterSpacing: "0.1em",
            ...(dark ? { color: "rgba(255,255,255,0.38)" } : {}),
          }}
        >
          Coaching Management
        </span>
      </div>
    </div>
  );
};

export default Logo;
