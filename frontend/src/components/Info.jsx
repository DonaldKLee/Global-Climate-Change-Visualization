import { useEffect, useRef, useState } from "react";

export default function Info() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);

  // Esc to close modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shellStyle = {
    position: "absolute",
    zIndex: 10,
    top: 28, // more space from the top
    right: 16,
    width: 360,
    color: "#e5e7eb",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.18)",
    background:
      "radial-gradient(1200px 600px at 100% 0%, rgba(56,189,248,0.10), transparent 40%), rgba(2, 6, 23, 0.72)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow:
      "0 12px 34px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
    padding: 14,
    transform: "translateY(6px)",
    overflowY: 'scroll',
    height: "80%",
  };

  const cardStyle = {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(15, 23, 42, 0.32)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const muted = { fontSize: 11.5, opacity: 0.72, lineHeight: 1.4 };

  const pillBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(15, 23, 42, 0.35)",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1,
    transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
  };

  const linkStyle = {
    color: "rgba(226,232,240,0.92)",
    textDecoration: "none",
  };

  const linkHoverStyle = {
    textDecoration: "underline",
    textUnderlineOffset: 3,
  };

  const sectionTitleStyle = {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.9,
    letterSpacing: 0.2,
  };

  const subtleDivider = {
    height: 1,
    background: "rgba(148,163,184,0.16)",
    marginTop: 12,
    marginBottom: 4,
  };

  return (
    <>
      {/* Right panel */}
      <div style={shellStyle}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.2 }}>
              Insights
            </div>
          </div>

          <button
            style={pillBase}
            onClick={() => setOpen(true)}
            title="Open datasets modal"
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              e.currentTarget.style.border = "1px solid rgba(148,163,184,0.30)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.35)";
              e.currentTarget.style.border = "1px solid rgba(148,163,184,0.22)";
            }}
          >
            Datasets
          </button>
        </div>

        <div style={subtleDivider} />

        {/* Temperature info box */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={sectionTitleStyle}>Temperature</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.5, opacity: 0.92 }}>
            From the map, we can see that the average temperature is increasing over time. This is because every year more greenhouse gases are trapping
            heat in our atmosphere. Unfortunately we cannot reverse climate change nor global warming, but we can slow it down.
            <br/><br/>
            One way is to cut emissions by using clean energy, protecting our ecosystems, reduce methane and other short-lived pollutants, grow more trees, and reduce our waste.
          </div>

          <div style={{ marginTop: 10, ...muted}}>
            Note: global average temperature prior to 1850 is skewed due to lack of data.
          </div>
        </div>

        {/* CO2 info box */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={sectionTitleStyle}>CO₂</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.5, opacity: 0.92 }}>
            CO₂ often grows with population and economic activity. The Kaya identity
            explains this using the following equation: CO₂ = population × affluence × electricity intensity ×
            carbon intensity. More Co₂ in the atmosphere results in warmer temperatures. To reduce CO₂ emissions we can switch to clean
            energy, aim to be more sustainable as humans, and explore carbon dioxide removal methods.
          </div>
        </div>

        {/* Sea level info box */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={sectionTitleStyle}>Sea Level</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.5, opacity: 0.92 }}>
            Every year sea level rises globally. Sea level rises are a contribution of added melted water from land, and due to thermal expansion (warm water expands, high temperatures are resulting in warmer oceans).
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <a
            href="https://donaldlee.xyz/"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 11.5,
              opacity: 0.75,
              color: "rgba(226,232,240,0.92)",
              textDecoration: "none",
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.14)",
              background: "rgba(15,23,42,0.20)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.95";
              e.currentTarget.style.border = "1px solid rgba(148,163,184,0.28)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.75";
              e.currentTarget.style.border = "1px solid rgba(148,163,184,0.14)";
              e.currentTarget.style.background = "rgba(15,23,42,0.20)";
            }}
          >
            by Donald Lee
          </a>
        </div>
      </div>

      {/* Modal */}
      {open ? (
        <div
          ref={overlayRef}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background:
              "radial-gradient(900px 500px at 70% 10%, rgba(56,189,248,0.12), transparent 55%), rgba(0,0,0,0.50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: "min(720px, 92vw)",
              borderRadius: 20,
              border: "1px solid rgba(148,163,184,0.22)",
              background: "rgba(2, 6, 23, 0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
              color: "#e5e7eb",
              padding: 16,
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
                <div style={{ fontSize: 16, fontWeight: 950, letterSpacing: 0.2 }}>
                    Datasets Used
                </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "9px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.22)",
                  background: "rgba(15, 23, 42, 0.35)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                  transition: "background 120ms ease, transform 120ms ease",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.35)")}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {/* Sources list */}
              <div style={cardStyle}>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontSize: 12.5 }}>
                    <div style={{ fontWeight: 900, opacity: 0.92 }}>
                        Earth Surface Temperature Changes
                    </div>
                    <a
                      href="https://www.kaggle.com/datasets/berkeleyearth/climate-change-earth-surface-temperature-data?resource=download"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = linkHoverStyle.textDecoration)}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      Kaggle • Berkeley Earth Surface Temperature Data
                    </a>
                  </div>

                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 900, opacity: 0.92 }}>
                      CO₂ and Greenhouse gas emissions per Country
                    </div>
                    <a
                      href="https://ourworldindata.org/co2-and-greenhouse-gas-emissions"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = linkHoverStyle.textDecoration)}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      Our World in Data • CO₂ and Greenhouse Gas Emissions
                    </a>
                  </div>

                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 900, opacity: 0.92 }}>
                      Global sea level rise
                    </div>
                    <a
                      href="https://www.kaggle.com/datasets/jarredpriester/global-sea-level-rise"
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = linkHoverStyle.textDecoration)}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      Kaggle • Global Sea Level Rise
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ ...muted, paddingLeft: 2 }}>
                Press <span style={{ fontWeight: 950 }}>Esc</span> to close this modal.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
