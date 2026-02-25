"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FileText,
  Mail,
  Globe,
  Sparkles,
  Heart,
  CheckCircle,
  X,
  Wand2,
} from "lucide-react";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<
    "resume" | "coverletter" | "portfolio"
  >("resume");
  const [category, setCategory] = useState("all");
  const [coverLetterSort, setCoverLetterSort] = useState<"new" | "popular">(
    "popular",
  );
  const [portfolioSort, setPortfolioSort] = useState<"new" | "popular">(
    "popular",
  );
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Read URL hash on mount and set active tab
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "resume" || hash === "coverletter" || hash === "portfolio") {
      setActiveTab(hash);
    }
  }, []);

  const handleAICreate = () => {
    setShowAIModal(true);
  };

  const handleChooseTemplate = () => {
    // Store prompt in sessionStorage for later use
    if (aiPrompt.trim()) {
      sessionStorage.setItem("aiPrompt", aiPrompt);
    }
    // Navigate back to templates to choose a template - close modal and let user browse
    setShowAIModal(false);
    // The user will select a template, and we'll pass the prompt along
  };

  const handleContinue = () => {
    // Navigate to builder with AI content
    const encodedPrompt = encodeURIComponent(aiPrompt);
    window.location.href = `/builder?ai=1&prompt=${encodedPrompt}`;
  };
  const resumeTemplates = [
    {
      id: "modern-green",
      name: "Modern Green",
      desc: "Dark, bold - ideal for tech roles",
      badge: "",
    },
    {
      id: "classic-blue",
      name: "Classic Blue",
      desc: "Traditional layout, trusted by HR",
      badge: "",
    },
    {
      id: "executive",
      name: "Executive",
      desc: "Two-column, great for senior roles",
      badge: "",
    },
    {
      id: "minimal",
      name: "Minimal",
      desc: "Clean, universal, every industry",
      badge: "",
    },
    {
      id: "bold-navy",
      name: "Bold Navy",
      desc: "Corporate, finance & law roles",
      badge: "",
    },
    {
      id: "soft-sage",
      name: "Soft Sage",
      desc: "Fresh, modern - NGO & education",
      badge: "",
    },
    {
      id: "creative",
      name: "Creative Studio",
      desc: "Bold - design, media & arts",
      badge: "",
    },
    {
      id: "simple-clean",
      name: "Simple Clean",
      desc: "Pure black & white, zero distraction",
      badge: "",
    },
  ];

  const filteredTemplates =
    category === "all"
      ? resumeTemplates
      : resumeTemplates.filter((t: { name: string; badge: string }) => {
          if (category === "ats") return t.badge.includes("ATS");
          if (category === "simple")
            return (
              t.name.toLowerCase().includes("minimal") ||
              t.name.toLowerCase().includes("simple")
            );
          if (category === "modern")
            return (
              t.name.toLowerCase().includes("modern") ||
              t.name.toLowerCase().includes("green")
            );
          if (category === "creative")
            return (
              t.name.toLowerCase().includes("creative") ||
              t.name.toLowerCase().includes("studio")
            );
          return true;
        });

  const coverLetterTemplates = [
    {
      id: "professional",
      name: "Professional",
      desc: "Clean, formal - corporate roles",
      badge: "Free",
      isNew: false,
    },
    {
      id: "modern-green",
      name: "Modern Green",
      desc: "Fresh, stands out from the crowd",
      badge: "Free",
      isNew: true,
    },
    {
      id: "simple-clean",
      name: "Simple Clean",
      desc: "Minimalist, zero distraction",
      badge: "Free",
      isNew: false,
    },
    {
      id: "executive",
      name: "Executive",
      desc: "Two-column, senior leadership",
      badge: "Free",
      isNew: false,
    },
  ];

  const sortedCoverLetterTemplates = [...coverLetterTemplates].sort((a, b) => {
    if (coverLetterSort === "new") return a.isNew ? -1 : 1;
    return b.isNew ? 1 : -1;
  });

  const portfolioTemplates = [
    {
      id: "dev",
      name: "Dev Portfolio",
      desc: "Dark, clean - ideal for developers",
      badge: "",
      isNew: false,
    },
    {
      id: "designer",
      name: "Designer",
      desc: "Visual-first, showcase your work",
      badge: "",
      isNew: true,
    },
    {
      id: "business",
      name: "Business Pro",
      desc: "Clean grid - consulting & business",
      badge: "",
      isNew: false,
    },
    {
      id: "emerald",
      name: "Emerald",
      desc: "Sophisticated - finance & management",
      badge: "",
      isNew: true,
    },
  ];

  const sortedPortfolioTemplates = [...portfolioTemplates].sort((a, b) => {
    if (portfolioSort === "new") return a.isNew ? -1 : 1;
    return b.isNew ? 1 : -1;
  });

  return (
    <>
      <style jsx global>{`
        @media (min-width: 1024px) {
          .templates-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 1023px) {
          .templates-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          body {
            overflow-x: hidden;
          }
          .category-buttons {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            gap: 6px !important;
          }
          .category-buttons button {
            flex-shrink: 0 !important;
            padding: 6px 12px !important;
            font-size: 0.7rem !important;
          }
          .create-ai-btn-mobile {
            display: none !important;
          }
          .nav-tabs-mobile {
            white-space: nowrap !important;
          }
          .nav-tabs-mobile button {
            padding: 12px 16px !important;
            font-size: 0.75rem !important;
          }
        }
        @media (max-width: 600px) {
          .templates-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        .ai-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--green);
          color: #fff;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 168, 68, 0.4);
          z-index: 100;
          align-items: center;
          justify-content: center;
          display: none;
        }
        @media (max-width: 1023px) {
          .ai-fab {
            display: flex !important;
          }
        }
        .ai-fab:hover {
          transform: scale(1.1);
        }
      `}</style>
      {/* Navigation */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            Career<span>AI</span>
          </Link>
          <div className="nav-center">
            <button
              onClick={() => setActiveTab("resume")}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: activeTab === "resume" ? "var(--green)" : "var(--muted)",
              }}
            >
              Resume / CV
            </button>
            <button
              onClick={() => setActiveTab("coverletter")}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color:
                  activeTab === "coverletter" ? "var(--green)" : "var(--muted)",
              }}
            >
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color:
                  activeTab === "portfolio" ? "var(--green)" : "var(--muted)",
              }}
            >
              Portfolio
            </button>
            <Link href="/analyzer" className="nav-link">
              ATS Analyzer
            </Link>
          </div>
          <div className="nav-right">
            {typeof window !== "undefined" &&
            localStorage.getItem("isAuthenticated") ? (
              <Link href="/dashboard" className="btn-nav-cta">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-nav-cta">
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div
        style={{
          padding: "108px 0 0",
          background: "linear-gradient(160deg, #f0faf4 0%, #ffffff 60%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "1400px",
            margin: "0 auto",
            paddingBottom: "0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.78rem",
              color: "var(--muted)",
              marginBottom: "20px",
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--green)", textDecoration: "none" }}
            >
              Home
            </Link>
            <span>›</span>
            <span>
              {activeTab === "resume" && "Resume / CV Templates"}
              {activeTab === "coverletter" && "Cover Letter Templates"}
              {activeTab === "portfolio" && "Portfolio Templates"}
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              marginBottom: "10px",
            }}
          >
            {activeTab === "resume" && "Resume & CV Templates"}
            {activeTab === "coverletter" && "Cover Letter Templates"}
            {activeTab === "portfolio" && "Portfolio Templates"}
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.97rem",
              fontWeight: 300,
              maxWidth: "520px",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}
          >
            {activeTab === "resume" &&
              "Professional, ATS-optimized templates designed to get you noticed. Choose a design and let AI fill it in for you."}
            {activeTab === "coverletter" &&
              "Stand out with a tailored cover letter. AI matches your skills to the job description for every application."}
            {activeTab === "portfolio" &&
              "Showcase your work with a professional portfolio. Get a hosted link to share with employers."}
          </p>

          {/* Tabs */}
          <div
            className="nav-tabs-mobile"
            style={{
              display: "flex",
              gap: 0,
              borderTop: "1px solid var(--border)",
              marginTop: "8px",
            }}
          >
            <button
              onClick={() => setActiveTab("resume")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "16px 28px",
                background:
                  activeTab === "resume" ? "var(--green-light)" : "none",
                border: "none",
                borderBottom:
                  activeTab === "resume"
                    ? "3px solid var(--green)"
                    : "3px solid transparent",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: activeTab === "resume" ? "var(--green)" : "var(--muted)",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              <FileText size={18} /> Resume / CV
            </button>
            <button
              onClick={() => setActiveTab("coverletter")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "16px 28px",
                background:
                  activeTab === "coverletter" ? "var(--green-light)" : "none",
                border: "none",
                borderBottom:
                  activeTab === "coverletter"
                    ? "3px solid var(--green)"
                    : "3px solid transparent",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 600,
                color:
                  activeTab === "coverletter" ? "var(--green)" : "var(--muted)",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              <Mail size={18} /> Cover Letter
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "16px 28px",
                background:
                  activeTab === "portfolio" ? "var(--green-light)" : "none",
                border: "none",
                borderBottom:
                  activeTab === "portfolio"
                    ? "3px solid var(--green)"
                    : "3px solid transparent",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 600,
                color:
                  activeTab === "portfolio" ? "var(--green)" : "var(--muted)",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              <Globe size={18} /> Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          width: "90%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 0 80px",
          overflowX: "hidden",
        }}
      >
        {/* Resume Section */}
        {activeTab === "resume" && (
          <section id="resume" style={{ padding: 0, marginBottom: "60px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div
                className="category-buttons"
                style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
              >
                <button
                  onClick={() => setCategory("all")}
                  style={{
                    background:
                      category === "all" ? "var(--green-light)" : "var(--bg2)",
                    border:
                      category === "all"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color: category === "all" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setCategory("ats")}
                  style={{
                    background:
                      category === "ats" ? "var(--green-light)" : "var(--bg2)",
                    border:
                      category === "ats"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color: category === "ats" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                  }}
                >
                  ATS
                </button>
                <button
                  onClick={() => setCategory("simple")}
                  style={{
                    background:
                      category === "simple"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      category === "simple"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      category === "simple" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                  }}
                >
                  Simple
                </button>
                <button
                  onClick={() => setCategory("modern")}
                  style={{
                    background:
                      category === "modern"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      category === "modern"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      category === "modern" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                  }}
                >
                  Modern
                </button>
                <button
                  onClick={() => setCategory("creative")}
                  style={{
                    background:
                      category === "creative"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      category === "creative"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      category === "creative" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                  }}
                >
                  Creative
                </button>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  onClick={handleAICreate}
                  className="create-ai-btn-mobile"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--green)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Sparkles size={14} /> Create with AI
                </button>
              </div>
            </div>

            <div className="templates-grid">
              {filteredTemplates.map((template) => {
                const storedPrompt =
                  typeof window !== "undefined"
                    ? sessionStorage.getItem("aiPrompt")
                    : "";
                const promptParam = storedPrompt
                  ? `&prompt=${encodeURIComponent(storedPrompt)}`
                  : "";
                return (
                  <Link
                    href={`/builder?template=${template.id}${promptParam}`}
                    key={template.id}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        border: "1.5px solid var(--border)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          height: "220px",
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "stretch",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            background: "#0d1f1a",
                            padding: "16px",
                          }}
                        >
                          <div
                            style={{
                              height: "44px",
                              background:
                                "linear-gradient(135deg,#00a844,#00695c)",
                              borderRadius: "7px",
                              marginBottom: "12px",
                              display: "flex",
                              alignItems: "center",
                              padding: "0 12px",
                              gap: "9px",
                            }}
                          >
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                flexShrink: 0,
                              }}
                            ></div>
                            <div>
                              <div
                                style={{
                                  height: "5px",
                                  width: "62px",
                                  background: "rgba(255,255,255,0.85)",
                                  borderRadius: "2px",
                                  marginBottom: "4px",
                                }}
                              ></div>
                              <div
                                style={{
                                  height: "3px",
                                  width: "40px",
                                  background: "rgba(255,255,255,0.4)",
                                  borderRadius: "2px",
                                }}
                              ></div>
                            </div>
                          </div>
                          <div
                            style={{
                              height: "3px",
                              width: "44%",
                              background: "#00c853",
                              borderRadius: "2px",
                              marginBottom: "9px",
                              opacity: 0.8,
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              background: "rgba(255,255,255,0.1)",
                              borderRadius: "2px",
                              marginBottom: "5px",
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              width: "82%",
                              background: "rgba(255,255,255,0.1)",
                              borderRadius: "2px",
                              marginBottom: "5px",
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              width: "58%",
                              background: "rgba(255,255,255,0.1)",
                              borderRadius: "2px",
                              marginBottom: "14px",
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              width: "38%",
                              background: "#00c853",
                              borderRadius: "2px",
                              marginBottom: "8px",
                              opacity: 0.55,
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "2px",
                              marginBottom: "4px",
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              width: "74%",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "2px",
                              marginBottom: "4px",
                            }}
                          ></div>
                          <div
                            style={{
                              height: "3px",
                              width: "52%",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "16px 18px",
                          borderTop: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: "var(--text)",
                              marginBottom: "3px",
                            }}
                          >
                            {template.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--muted)",
                            }}
                          >
                            {template.desc}
                          </div>
                        </div>
                        {template.badge && (
                          <span
                            style={{
                              display: "inline-block",
                              background: "var(--green-light)",
                              border: "1px solid var(--green-mid)",
                              color: "var(--green)",
                              fontSize: "0.63rem",
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: "5px",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          >
                            {template.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--green-light), #f0fdf4)",
                border: "1.5px solid var(--green-mid)",
                borderRadius: "20px",
                padding: "40px 48px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                textAlign: "center",
                marginTop: "56px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: "6px",
                  }}
                >
                  Not sure which template to pick?
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  Use AI Create Mode - enter your role and skills and we'll
                  suggest the best template for your industry.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Link
                  href="/builder"
                  className="btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  <Sparkles size={16} style={{ marginRight: "6px" }} /> Let AI
                  Choose
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Cover Letter Section */}
        {activeTab === "coverletter" && (
          <section
            id="coverletter"
            style={{ padding: 0, marginBottom: "60px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setCoverLetterSort("new")}
                  style={{
                    background:
                      coverLetterSort === "new"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      coverLetterSort === "new"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      coverLetterSort === "new"
                        ? "var(--green)"
                        : "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  New
                </button>
                <button
                  onClick={() => setCoverLetterSort("popular")}
                  style={{
                    background:
                      coverLetterSort === "popular"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      coverLetterSort === "popular"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      coverLetterSort === "popular"
                        ? "var(--green)"
                        : "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Popular
                </button>
              </div>
              <button
                onClick={handleAICreate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--green)",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "9px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Sparkles size={16} /> Create with AI
              </button>
            </div>
            <div className="templates-grid">
              {sortedCoverLetterTemplates.map((template) => (
                <Link
                  href={`/builder?type=coverletter`}
                  key={template.id}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  >
                    <div
                      style={{
                        height: "180px",
                        padding: "20px",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          height: "5px",
                          width: "52px",
                          background: "#1565c0",
                          borderRadius: "2px",
                          marginBottom: "6px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "7px",
                          width: "88px",
                          background: "#0d1f14",
                          borderRadius: "2px",
                          marginBottom: "4px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "3px",
                          width: "60px",
                          background: "#bbb",
                          borderRadius: "2px",
                          marginBottom: "16px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "3px",
                          background: "#eee",
                          borderRadius: "2px",
                          marginBottom: "4px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "3px",
                          width: "92%",
                          background: "#eee",
                          borderRadius: "2px",
                          marginBottom: "4px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "3px",
                          width: "78%",
                          background: "#eee",
                          borderRadius: "2px",
                          marginBottom: "12px",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        padding: "16px 18px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "var(--text)",
                            marginBottom: "3px",
                          }}
                        >
                          {template.name}
                        </div>
                        <div
                          style={{ fontSize: "0.74rem", color: "var(--muted)" }}
                        >
                          {template.desc}
                        </div>
                      </div>
                      {template.badge && (
                        <span
                          style={{
                            display: "inline-block",
                            background: "#e8f5e9",
                            border: "1px solid #a5d6a7",
                            color: "#2e7d32",
                            fontSize: "0.63rem",
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: "5px",
                          }}
                        >
                          {template.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--green-light), #f0fdf4)",
                border: "1.5px solid var(--green-mid)",
                borderRadius: "20px",
                padding: "40px 48px",
                marginTop: "40px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                <Sparkles
                  size={20}
                  style={{ display: "inline", marginRight: "6px" }}
                />{" "}
                Cover letters are completely free
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.88rem",
                  marginBottom: "20px",
                }}
              >
                Create an account and generate unlimited tailored cover letters
                - one for each job you apply to, always free.
              </p>
              <button
                onClick={handleAICreate}
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Mail size={16} style={{ marginRight: "6px" }} /> Generate Cover
                Letter
              </button>
            </div>
          </section>
        )}

        {/* Portfolio Section */}
        {activeTab === "portfolio" && (
          <section id="portfolio" style={{ padding: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setPortfolioSort("new")}
                  style={{
                    background:
                      portfolioSort === "new"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      portfolioSort === "new"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      portfolioSort === "new" ? "var(--green)" : "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  New
                </button>
                <button
                  onClick={() => setPortfolioSort("popular")}
                  style={{
                    background:
                      portfolioSort === "popular"
                        ? "var(--green-light)"
                        : "var(--bg2)",
                    border:
                      portfolioSort === "popular"
                        ? "1.5px solid var(--green)"
                        : "1.5px solid var(--border)",
                    color:
                      portfolioSort === "popular"
                        ? "var(--green)"
                        : "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Popular
                </button>
              </div>
              <button
                onClick={handleAICreate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--green)",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "9px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Sparkles size={16} /> Create with AI
              </button>
            </div>
            <div className="templates-grid">
              {sortedPortfolioTemplates.map((template) => (
                <Link
                  href={`/builder?type=portfolio`}
                  key={template.id}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  >
                    <div
                      style={{
                        height: "180px",
                        background: "#0d1f1a",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          height: "36px",
                          background: "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          padding: "0 12px",
                          gap: "6px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#ff5f57",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#febc2e",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#28c840",
                          }}
                        ></div>
                      </div>
                      <div
                        style={{
                          height: "5px",
                          width: "70px",
                          background: "#00c853",
                          borderRadius: "2px",
                          marginBottom: "6px",
                        }}
                      ></div>
                      <div
                        style={{
                          height: "4px",
                          width: "100px",
                          background: "rgba(255,255,255,0.15)",
                          borderRadius: "2px",
                          marginBottom: "14px",
                        }}
                      ></div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            height: "42px",
                            background: "rgba(0,200,83,0.1)",
                            borderRadius: "6px",
                            border: "1px solid rgba(0,200,83,0.2)",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "42px",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "6px",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "42px",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "6px",
                          }}
                        ></div>
                        <div
                          style={{
                            height: "42px",
                            background: "rgba(0,200,83,0.07)",
                            borderRadius: "6px",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px 18px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "var(--text)",
                            marginBottom: "3px",
                          }}
                        >
                          {template.name}
                        </div>
                        <div
                          style={{ fontSize: "0.74rem", color: "var(--muted)" }}
                        >
                          {template.desc}
                        </div>
                      </div>
                      {template.badge && (
                        <span
                          style={{
                            display: "inline-block",
                            background: "var(--green-light)",
                            border: "1px solid var(--green-mid)",
                            color: "var(--green)",
                            fontSize: "0.63rem",
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: "5px",
                          }}
                        >
                          {template.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating AI Button for Mobile */}
      {activeTab === "resume" && (
        <button
          onClick={handleAICreate}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--green)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0, 168, 68, 0.4)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="ai-fab"
        >
          <Sparkles size={20} />
        </button>
      )}
      <style jsx>{`
        @media (min-width: 1024px) {
          .ai-fab {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .ai-fab {
            display: flex !important;
          }
        }
      `}</style>

      {/* Footer */}
      <footer
        style={{ background: "#0f1f14", color: "#8aab92", padding: "40px 0 0" }}
      >
        <div style={{ width: "90%", maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "28px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
              Career<span style={{ color: "#00c853" }}>AI</span> Kenya
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "0.82rem" }}>
              <button
                onClick={() => setActiveTab("resume")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8aab92",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                CV Templates
              </button>
              <button
                onClick={() => setActiveTab("coverletter")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8aab92",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                Cover Letters
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8aab92",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                Portfolios
              </button>
            </div>
          </div>
          <div
            style={{ padding: "20px 0", fontSize: "0.78rem", color: "#4a6350" }}
          >
            © 2025 CareerAI Kenya. All rights reserved. Made with{" "}
            <Heart size={14} style={{ display: "inline", margin: "0 2px" }} />{" "}
            in Kenya.
          </div>
        </div>
        {/* AI Create Modal */}
        {showAIModal && (
          <div
            onClick={() => setShowAIModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "32px",
                maxWidth: "500px",
                width: "90%",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              <button
                onClick={() => setShowAIModal(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "var(--green-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "var(--green)",
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Create with AI
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  Describe your experience and skills, and AI will generate your{" "}
                  {activeTab === "resume"
                    ? "CV"
                    : activeTab === "coverletter"
                      ? "cover letter"
                      : "portfolio"}
                </p>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Software developer with 5 years experience in React, Node.js, and Python..."
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "14px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "none",
                  marginBottom: "20px",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleChooseTemplate}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border)",
                    background: "#fff",
                    color: "var(--text)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Choose Template
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!aiPrompt.trim() || aiLoading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: aiPrompt.trim() ? "var(--green)" : "var(--bg2)",
                    color: aiPrompt.trim() ? "#fff" : "var(--muted)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: aiPrompt.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {aiLoading ? "Generating..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>
    </>
  );
}
