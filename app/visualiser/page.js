"use client";
import { useState, useRef, useCallback } from "react";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";
const RED = "#e07070";

const FLOORING_OPTIONS = [
  {
    id: "light-oak-lvt",
    name: "Light Oak LVT",
    desc: "Warm, natural oak wood effect",
    swatch: "#C4A882",
  },
  {
    id: "dark-walnut-lvt",
    name: "Dark Walnut LVT",
    desc: "Rich, deep walnut luxury vinyl",
    swatch: "#3D2B1F",
  },
  {
    id: "herringbone-oak",
    name: "Herringbone Oak",
    desc: "Classic chevron parquet pattern",
    swatch: "#B8976A",
  },
  {
    id: "grey-ash-lvt",
    name: "Grey Ash LVT",
    desc: "Cool, contemporary ash effect",
    swatch: "#8A8A84",
  },
  {
    id: "light-grey-carpet",
    name: "Light Grey Carpet",
    desc: "Soft, plush dove grey pile",
    swatch: "#C2C2C0",
  },
  {
    id: "charcoal-carpet",
    name: "Charcoal Carpet",
    desc: "Moody, deep charcoal pile",
    swatch: "#3A3A38",
  },
  {
    id: "cream-carpet",
    name: "Cream Carpet",
    desc: "Warm, ivory Saxony pile",
    swatch: "#E8DEC8",
  },
  {
    id: "slate-tile",
    name: "Slate Tile",
    desc: "Natural stone slate effect",
    swatch: "#5A6268",
  },
];

const spinKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
`;

export default function VisualiserPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFlooring, setSelectedFlooring] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [loadingDots, setLoadingDots] = useState(0);
  const fileInputRef = useRef(null);
  const dotsRef = useRef(null);

  const startDotsAnimation = () => {
    let count = 0;
    dotsRef.current = setInterval(() => {
      count = (count + 1) % 4;
      setLoadingDots(count);
    }, 500);
  };

  const stopDotsAnimation = () => {
    if (dotsRef.current) clearInterval(dotsRef.current);
    setLoadingDots(0);
  };

  const handleFile = useCallback((file) => {
    setUploadError(null);
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10MB.");
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const removeImage = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setSelectedFlooring(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVisualise = async () => {
    if (!uploadedFile || !selectedFlooring || loading) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    startDotsAnimation();

    try {
      const fd = new FormData();
      fd.append("image", uploadedFile);
      fd.append("flooring", selectedFlooring);

      const res = await fetch("/api/visualiser", { method: "POST", body: fd });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResultUrl(data.imageUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      stopDotsAnimation();
    }
  };

  const selectedFlooringObj = FLOORING_OPTIONS.find(
    (f) => f.id === selectedFlooring
  );

  const dots = ".".repeat(loadingDots);

  return (
    <>
      <style>{spinKeyframes}</style>
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, sans-serif",
          paddingBottom: 80,
        }}
      >
        {/* Header */}
        <div
          style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px 0" }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(201,169,110,0.10)",
              border: "1px solid rgba(201,169,110,0.28)",
              borderRadius: 4,
              padding: "4px 12px",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                color: GOLD,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Room Visualiser
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              color: TEXT,
              margin: "0 0 14px",
              lineHeight: 1.2,
            }}
          >
            See your new floor before it's fitted.
          </h1>

          <p
            style={{
              color: TEXT_MUTED,
              fontSize: 16,
              lineHeight: 1.65,
              margin: "0 0 20px",
            }}
          >
            Upload a photo of your room and choose a flooring type. We'll show
            you how it could look.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "rgba(201,169,110,0.06)",
              border: "1px solid rgba(201,169,110,0.18)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 44,
            }}
          >
            <span style={{ color: GOLD, fontSize: 14, marginTop: 1, flexShrink: 0 }}>
              ✦
            </span>
            <p
              style={{
                color: GOLD,
                fontSize: 13,
                lineHeight: 1.6,
                margin: 0,
                opacity: 0.85,
              }}
            >
              Best results come from photos taken straight-on at floor level
              with good natural light.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

          {/* ── STEP 1: Upload ── */}
          <div style={{ marginBottom: 36 }}>
            <StepLabel
              number="1"
              label="Upload your room photo"
              done={!!uploadedFile}
            />

            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${
                    isDragOver ? GOLD : "rgba(201,169,110,0.3)"
                  }`,
                  borderRadius: 12,
                  background: isDragOver
                    ? "rgba(201,169,110,0.04)"
                    : SURFACE,
                  padding: "60px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 18, opacity: 0.45 }}>
                  📷
                </div>
                <p
                  style={{
                    color: TEXT,
                    fontSize: 15,
                    fontWeight: 500,
                    margin: "0 0 8px",
                  }}
                >
                  Drop your photo here, or tap to upload
                </p>
                <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0 }}>
                  JPG, PNG or WebP — max 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${BORDER}`,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Your room"
                  style={{
                    width: "100%",
                    display: "block",
                    maxHeight: 420,
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={removeImage}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(17,17,16,0.82)",
                    border: `1px solid ${BORDER}`,
                    color: TEXT_MUTED,
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {uploadError && (
              <p style={{ color: RED, fontSize: 13, margin: "8px 0 0" }}>
                {uploadError}
              </p>
            )}

            {previewUrl && !resultUrl && (
              <p
                style={{
                  color: TEXT_MUTED,
                  fontSize: 14,
                  margin: "14px 0 0",
                  fontStyle: "italic",
                }}
              >
                Looking good. Now choose your flooring below.
              </p>
            )}
          </div>

          {/* ── STEP 2: Flooring selection ── */}
          {previewUrl && (
            <div style={{ marginBottom: 36 }}>
              <StepLabel
                number="2"
                label="Choose your flooring"
                done={!!selectedFlooring}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10,
                }}
              >
                {FLOORING_OPTIONS.map((floor) => {
                  const isSelected = selectedFlooring === floor.id;
                  return (
                    <button
                      key={floor.id}
                      onClick={() => {
                        setSelectedFlooring(floor.id);
                        setResultUrl(null);
                        setError(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 14px",
                        background: isSelected
                          ? "rgba(201,169,110,0.08)"
                          : SURFACE,
                        border: `1px solid ${isSelected ? GOLD : BORDER}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          background: floor.swatch,
                          flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: isSelected ? GOLD : TEXT,
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 3,
                          }}
                        >
                          {floor.name}
                        </div>
                        <div
                          style={{
                            color: TEXT_MUTED,
                            fontSize: 11,
                            lineHeight: 1.4,
                          }}
                        >
                          {floor.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Visualise button ── */}
          {previewUrl && selectedFlooring && (
            <div style={{ marginBottom: 32 }}>
              <button
                onClick={handleVisualise}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "17px 24px",
                  background: loading
                    ? "rgba(201,169,110,0.25)"
                    : GOLD,
                  color: loading ? TEXT_MUTED : "#111110",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                  transition: "background 0.2s, color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        border: `2px solid rgba(160,152,128,0.3)`,
                        borderTopColor: TEXT_MUTED,
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Generating your visualisation{dots}
                  </>
                ) : resultUrl ? (
                  `Try a different floor`
                ) : (
                  `Visualise with ${selectedFlooringObj?.name}`
                )}
              </button>

              {loading && (
                <p
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 13,
                    textAlign: "center",
                    margin: "12px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Our AI is applying your floor — this usually takes 20–40
                  seconds.
                </p>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                background: "rgba(224,112,112,0.07)",
                border: "1px solid rgba(224,112,112,0.22)",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 28,
              }}
            >
              <p style={{ color: RED, fontSize: 14, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* ── Result ── */}
          {resultUrl && (
            <div>
              <StepLabel number="✓" label="Your visualisation is ready" done />

              {/* Before / After */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      margin: "0 0 8px",
                    }}
                  >
                    Before
                  </p>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Before"
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "4 / 3",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: GOLD,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      margin: "0 0 8px",
                    }}
                  >
                    {selectedFlooringObj?.name}
                  </p>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `1px solid rgba(201,169,110,0.5)`,
                    }}
                  >
                    <img
                      src={resultUrl}
                      alt={`Room with ${selectedFlooringObj?.name}`}
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "4 / 3",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: TEXT_MUTED,
                  fontSize: 12,
                  textAlign: "center",
                  margin: "0 0 22px",
                  lineHeight: 1.6,
                  padding: "0 16px",
                }}
              >
                AI-generated preview — actual results may vary based on
                lighting and room conditions.
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                <button
                  onClick={() => {
                    setResultUrl(null);
                    setSelectedFlooring(null);
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "13px 16px",
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    color: TEXT_MUTED,
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Try another floor
                </button>
                <a
                  href={resultUrl}
                  download="strata-visualisation.jpg"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    padding: "13px 16px",
                    background: GOLD,
                    color: "#111110",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Save image
                </a>
              </div>

              {/* Quote CTA */}
              <div
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 600,
                    color: TEXT,
                    margin: "0 0 10px",
                  }}
                >
                  Love the look?
                </h2>
                <p
                  style={{
                    color: TEXT_MUTED,
                    fontSize: 14,
                    margin: "0 0 20px",
                    lineHeight: 1.6,
                  }}
                >
                  Get a free quote for{" "}
                  <span style={{ color: TEXT }}>
                    {selectedFlooringObj?.name}
                  </span>{" "}
                  fitted in your home by our Essex &amp; London team.
                </p>
                <a
                  href="/"
                  style={{
                    display: "inline-block",
                    padding: "13px 32px",
                    background: "transparent",
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  Get a free quote →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StepLabel({ number, label, done }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 27,
          height: 27,
          borderRadius: "50%",
          background: done ? "rgba(201,169,110,0.12)" : SURFACE,
          border: `1px solid ${done ? GOLD : BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{ color: done ? GOLD : TEXT_MUTED, fontSize: 12, fontWeight: 600 }}
        >
          {done && number !== "✓" ? "✓" : number}
        </span>
      </div>
      <span style={{ color: done ? GOLD : TEXT, fontSize: 14, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}
