"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Search,
  Target,
  CheckCircle,
  AlertCircle,
  Sparkles,
  LogIn,
  UserPlus,
  X,
  Loader2,
} from "lucide-react";

interface CVData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  summary?: string;
  experience: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: { degree: string; institution: string; year: string }[];
  skills: string[];
  languages: string[];
}

interface ATSResult {
  score: number;
  keywordMatch: number;
  missingKeywords: string[];
  suggestions: string[];
}

export default function AnalyzerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Check if user is logged in (mock for now - would check Supabase)
  useEffect(() => {
    // In production, this would check Supabase auth state
    const checkAuth = async () => {
      // For demo purposes, let's assume not logged in
      setIsLoggedIn(false);
    };
    checkAuth();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    // Check if logged in
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      // Mock CV data for now - in production would parse uploaded file
      const cvData: CVData = {
        firstName: "User",
        lastName: "",
        role: "",
        email: "",
        phone: "",
        location: "",
        experience: [],
        education: [],
        skills: [],
        languages: [],
      };

      const response = await fetch("/api/ai/ats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          jobDescription: jobDescription || "General CV analysis",
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze CV. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#00a844";
    if (score >= 60) return "#febc2e";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <>
      {/* Navigation */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            Career<span>AI</span>
          </Link>
          <div className="nav-center">
            <Link href="/templates#resume" className="nav-link">
              Resume / CV
            </Link>
            <Link href="/templates#coverletter" className="nav-link">
              Cover Letter
            </Link>
            <Link href="/templates#portfolio" className="nav-link">
              Portfolio
            </Link>
            <Link
              href="/analyzer"
              className="nav-link active"
              style={{ color: "var(--green)" }}
            >
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

      {/* Main Content */}
      <div
        style={{
          paddingTop: "100px",
          minHeight: "100vh",
          background: "linear-gradient(160deg, #f0faf4 0%, #ffffff 60%)",
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "1200px",
            margin: "0 auto",
            paddingBottom: "80px",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                display: "inline-block",
                background: "var(--green-light)",
                color: "var(--green)",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <Target
                size={14}
                style={{ display: "inline", marginRight: "4px" }}
              />
              ATS Analyzer
            </span>
            <h1
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "12px",
              }}
            >
              Analyze Your CV Against Any Job
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "1rem",
                maxWidth: "540px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Upload your CV to get an ATS score, keyword analysis, and
              actionable recommendations to improve your chances.
            </p>
          </div>

          {/* Main Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
            }}
          >
            {/* Left Column - Input */}
            <div>
              {/* CV Upload Section */}
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border)",
                  borderRadius: "16px",
                  padding: "28px",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileText size={20} />
                  Your CV
                </h2>

                <div>
                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "12px",
                      padding: "48px 32px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" style={{ cursor: "pointer" }}>
                      <Upload
                        size={48}
                        style={{
                          color: "var(--green)",
                          marginBottom: "16px",
                        }}
                      />
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          marginBottom: "8px",
                        }}
                      >
                        {file
                          ? file.name
                          : "Drop your CV here or click to upload"}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        PDF or DOCX up to 5MB
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Description Section (Optional) */}
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid var(--border)",
                  borderRadius: "16px",
                  padding: "28px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Search size={20} />
                  Job Description{" "}
                  <span
                    style={{
                      color: "var(--muted)",
                      fontWeight: 400,
                      fontSize: "0.9rem",
                    }}
                  >
                    (optional)
                  </span>
                </h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description to get tailored recommendations..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "14px",
                    background:
                      isAnalyzing || !file ? "var(--muted)" : "var(--green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: isAnalyzing || !file ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Analyze CV
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div>
              {result ? (
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "16px",
                    padding: "28px",
                    position: "sticky",
                    top: "100px",
                  }}
                >
                  {/* Score Circle */}
                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div
                      style={{
                        width: "160px",
                        height: "160px",
                        borderRadius: "50%",
                        border: `8px solid ${getScoreColor(result.score)}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        background: `${getScoreColor(result.score)}10`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "3rem",
                          fontWeight: 800,
                          color: getScoreColor(result.score),
                        }}
                      >
                        {result.score}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: getScoreColor(result.score),
                        }}
                      >
                        / 100
                      </span>
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        background: `${getScoreColor(result.score)}20`,
                        color: getScoreColor(result.score),
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {getScoreLabel(result.score)}
                    </div>
                  </div>

                  {/* Keyword Match */}
                  <div
                    style={{
                      background: "var(--bg2)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Keyword Match</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            result.keywordMatch >= 70
                              ? "var(--green)"
                              : "var(--muted)",
                        }}
                      >
                        {result.keywordMatch}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "var(--border)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${result.keywordMatch}%`,
                          background:
                            result.keywordMatch >= 70
                              ? "var(--green)"
                              : "var(--muted)",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle
                        size={18}
                        style={{ color: "var(--muted)" }}
                      />
                      Missing Keywords
                    </h3>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {result.missingKeywords.length > 0 ? (
                        result.missingKeywords.map((keyword, i) => (
                          <span
                            key={i}
                            style={{
                              background: "var(--green-light)",
                              color: "var(--green)",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span
                          style={{
                            color: "var(--green)",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                          }}
                        >
                          <CheckCircle
                            size={16}
                            style={{
                              display: "inline",
                              marginRight: "4px",
                            }}
                          />
                          No missing keywords!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        marginBottom: "12px",
                      }}
                    >
                      Recommendations
                    </h3>
                    <ul style={{ paddingLeft: "20px" }}>
                      {result.suggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          style={{
                            marginBottom: "10px",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                            color: "var(--text)",
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply & Download */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    <Link
                      href="/builder"
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "var(--green)",
                        color: "#fff",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: 600,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <Sparkles size={18} />
                      Apply Suggestions
                    </Link>
                    <button
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "var(--bg2)",
                        color: "var(--text)",
                        border: "1.5px solid var(--border)",
                        borderRadius: "10px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <FileText size={18} />
                      Download Report
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "var(--bg2)",
                    borderRadius: "16px",
                    padding: "60px 32px",
                    textAlign: "center",
                  }}
                >
                  <Target
                    size={64}
                    style={{ color: "var(--muted)", marginBottom: "20px" }}
                  />
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    No Analysis Yet
                  </h3>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                      maxWidth: "280px",
                      margin: "0 auto",
                    }}
                  >
                    Upload your CV to get your ATS score and recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
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
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "420px",
              width: "90%",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
              }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "var(--green-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <LogIn size={32} style={{ color: "var(--green)" }} />
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Sign In Required
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  marginBottom: "24px",
                }}
              >
                Create a free account to analyze your CV and get personalized
                recommendations
              </p>

              <Link
                href="/login"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  background: "var(--green)",
                  color: "#fff",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                <LogIn
                  size={18}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                Log In
              </Link>

              <Link
                href="/signup"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  background: "var(--bg2)",
                  color: "var(--text)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <UserPlus
                  size={18}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                Create Account - Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
