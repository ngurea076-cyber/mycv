"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Generate preview and thumbnail
  const generatePreview = async () => {
    setLoading(true);
    try {
      // Here you would generate the preview based on the form data
      // This is a placeholder - you'll need to implement actual preview generation
      console.log("Generating preview with data:", formData);

      // For now, just show a simple preview modal
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadThumbnail = async () => {
    if (!formData.firstName || !formData.lastName) {
      alert("Please enter your first and last name to generate a thumbnail");
      return;
    }

    setLoadingThumbnail(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Ensure preview is visible so html2canvas can capture it
      if (!showPreview) {
        setShowPreview(true);
        await new Promise((r) => setTimeout(r, 250));
      }

      const el = previewRef.current;
      if (!el) throw new Error("Preview element not found");

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Create A4 PDF (210 x 297 mm)
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pdfWidth = 210;
      const imgProps = (pdf as any).getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.firstName}_${formData.lastName}_thumbnail.pdf`);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      alert("Error generating thumbnail. Please try again.");
    } finally {
      setLoadingThumbnail(false);
    }
  };

  // Tips content for each step
  const stepTips = {
    1: {
      title: "Personal Info Tips",
      dos: [
        "Use a professional email address",
        "Include your full legal name",
        "Add a valid phone number with country code",
        "LinkedIn should be a complete profile URL",
      ],
      donts: [
        "Don't use nicknames",
        "Don't use unprofessional email addresses",
        "Don't skip the summary - it's your elevator pitch",
      ],
    },
    2: {
      title: "Work Experience Tips",
      dos: [
        "Start with your most recent job",
        "Use action verbs (led, managed, achieved)",
        "Quantify achievements (saved $10K, increased sales 20%)",
        "Include relevant keywords from job description",
      ],
      donts: [
        "Don't list duties without achievements",
        "Don't use personal pronouns (I, me, my)",
        "Don't include irrelevant jobs",
        "Don't use bullet points longer than 2 lines",
      ],
    },
    3: {
      title: "Education Tips",
      dos: [
        "List highest qualification first",
        "Include relevant coursework if recent grad",
        "Add honors or notable achievements",
        "List certifications and training",
      ],
      donts: [
        "Don't list high school if you have a degree",
        "Don't include GPA unless specifically requested",
        "Don't add graduation dates if it reveals your age",
      ],
    },
    4: {
      title: "Skills Tips",
      dos: [
        "Include both technical and soft skills",
        "Add skills relevant to your target role",
        "Include proficiency levels for languages",
        "List tools and software you know",
      ],
      donts: [
        "Don't list every skill you have",
        "Don't include basic skills (MS Word, email)",
        "Don't lie about your skill levels",
      ],
    },
    5: {
      title: "Finalize Tips",
      dos: [
        "Proofread multiple times",
        "Check formatting is consistent",
        "Verify all contact information",
        "Save as PDF for best results",
      ],
      donts: [
        "Don't submit without testing",
        "Don't use unprofessional email addresses",
        "Don't forget to save your progress",
      ],
    },
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    summary: "",
    profilePicture: "",
    skills: [] as string[],
    languages: [] as string[],
  });

  const [experience, setExperience] = useState([
    {
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: "",
      institution: "",
      year: "",
      achievements: "",
    },
  ]);

  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  // Collapse state for experience and education
  const [collapsedExperience, setCollapsedExperience] = useState<number[]>([]);
  const [collapsedEducation, setCollapsedEducation] = useState<number[]>([]);

  const toggleExperienceCollapse = (index: number) => {
    setCollapsedExperience((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const toggleEducationCollapse = (index: number) => {
    setCollapsedEducation((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // Payment state
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentStep, setPaymentStep] = useState<
    "phone" | "processing" | "success"
  >("phone");
  const [checkoutId, setCheckoutId] = useState("");

  // Offers state
  const [offers, setOffers] = useState<any[]>([]);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [offerApplied, setOfferApplied] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Base price
  const basePrice = 100;

  // Calculate final price based on offer
  const calculatePrice = () => {
    if (!offerApplied || !activeOffer) return basePrice;

    if (activeOffer.discountType === "percentage") {
      return Math.round(basePrice * (1 - activeOffer.discountValue / 100));
    } else {
      return Math.max(0, basePrice - activeOffer.discountValue);
    }
  };

  // Load offers from localStorage on mount
  useEffect(() => {
    const savedOffers = localStorage.getItem("offers");
    if (savedOffers) {
      try {
        const parsedOffers = JSON.parse(savedOffers);
        setOffers(parsedOffers);

        // Get user's purchase count from localStorage
        const purchaseCount = parseInt(
          localStorage.getItem("purchaseCount") || "0",
        );

        // Find applicable offer based on purchase history
        // purchaseCount: 0 = first time, 1 = second time, 2+ = returning
        let userCondition = "open_to_all";
        if (purchaseCount === 0) {
          userCondition = "first_purchase";
        } else if (purchaseCount === 1) {
          userCondition = "second_purchase";
        }

        // Find active offer that matches user's condition
        const applicableOffer = parsedOffers.find(
          (o: any) =>
            o.isActive &&
            (o.condition === "open_to_all" || o.condition === userCondition),
        );

        if (applicableOffer) {
          setActiveOffer(applicableOffer);
        }
      } catch (e) {
        console.error("Error loading offers:", e);
      }
    }
  }, []);

  // Handle applying the offer (when user clicks the action button)
  const handleApplyOffer = () => {
    if (activeOffer) {
      setOfferApplied(true);
    }
  };

  const totalSteps = 5;

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    if (langInput.trim() && !formData.languages.includes(langInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, langInput.trim()],
      }));
      setLangInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    if (experience.length > 1) {
      setExperience(experience.filter((_, i) => i !== index));
    }
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", institution: "", year: "", achievements: "" },
    ]);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  // AI Functions
  const generateSummary = async () => {
    if (!formData.role) {
      alert("Please enter your target role first");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: formData.role, skills: formData.skills }),
      });
      const data = await response.json();
      if (data.summary) {
        setFormData((prev) => ({ ...prev, summary: data.summary }));
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    }
    setLoading(false);
  };

  const suggestSkills = async () => {
    if (!formData.role) {
      alert("Please enter your target role first");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: formData.role }),
      });
      const data = await response.json();
      if (data.skills) {
        setFormData((prev) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...data.skills])],
        }));
      }
    } catch (error) {
      console.error("Error suggesting skills:", error);
    }
    setLoading(false);
  };

  // Payment
  const initiatePayment = async () => {
    if (!paymentPhone) {
      alert("Please enter your M-Pesa phone number");
      return;
    }
    setPaymentStep("processing");
    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: paymentPhone,
          amount: calculatePrice(),
          documentType: "cv",
        }),
      });
      const data = await response.json();
      if (data.success && data.checkoutRequestId) {
        setCheckoutId(data.checkoutRequestId);
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        alert(data.error || "Payment failed. Please try again.");
        setPaymentStep("phone");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setPaymentStep("phone");
    }
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        alert("Payment timeout. Please check your M-Pesa and try again.");
        setPaymentStep("phone");
        return;
      }

      try {
        const response = await fetch("/api/payment/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutRequestId: checkoutId }),
        });
        const data = await response.json();

        if (data.success && data.status === "completed") {
          setPaymentStep("success");
        } else {
          attempts++;
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        attempts++;
        setTimeout(checkStatus, 2000);
      }
    };

    checkStatus();
  };

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Calculate CV score based on filled information
  const calculateScore = () => {
    let score = 0;
    const maxScore = 100;

    // Step 1: Personal Info (24 points)
    if (formData.profilePicture) score += 4;
    if (formData.firstName.trim()) score += 4;
    if (formData.lastName.trim()) score += 4;
    if (formData.role.trim()) score += 4;
    if (formData.email.trim()) score += 4;
    if (formData.phone.trim()) score += 4;

    // Step 2: Work Experience (30 points)
    const filledExperience = experience.filter(
      (exp) => exp.jobTitle.trim() && exp.company.trim(),
    ).length;
    if (filledExperience > 0) {
      score += Math.min(filledExperience * 10, 30);
    }

    // Step 3: Education (20 points)
    const filledEducation = education.filter(
      (edu) => edu.degree.trim() && edu.institution.trim(),
    ).length;
    if (filledEducation > 0) {
      score += Math.min(filledEducation * 10, 20);
    }

    // Step 4: Skills (20 points)
    if (formData.skills.length > 0) {
      score += Math.min(formData.skills.length * 4, 20);
    }

    // Step 5: Summary (10 points)
    if (formData.summary.trim() && formData.summary.length > 20) {
      score += 10;
    }

    return Math.min(score, maxScore);
  };

  const cvScore = calculateScore();
  const progress = cvScore;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style jsx>{`
        @media (max-width: 600px) {
          .step-progress-bar {
            gap: 0 !important;
            padding: 12px 8px !important;
          }
          .step-progress-bar span {
            font-size: 0.55rem !important;
          }
          .step-dot {
            width: 24px !important;
            height: 24px !important;
            font-size: 0.6rem !important;
          }
          .step-line {
            width: 20px !important;
            margin: 0 4px !important;
            margin-bottom: 14px !important;
          }
        }
      `}</style>
      {/* Topbar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: "60px",
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: "1.05rem",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          Career<span style={{ color: "var(--green)" }}>AI</span>
        </Link>
        <button
          onClick={() => setShowPreview(true)}
          style={{
            background: "var(--green)",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👁 Preview
        </button>
        <button
          onClick={downloadThumbnail}
          style={{
            background: "var(--green)",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginLeft: "12px",
          }}
        >
          📎 Download Thumbnail
        </button>
      </div>

      <div style={{ display: "flex", paddingTop: "60px", minHeight: "100vh" }}>
        {/* Step Progress Bar - Below Header */}
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            zIndex: 150,
            background: "#fff",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
          }}
        >
          {[1, 2, 3, 4, 5].map((step, index) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => jumpToStep(step)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: currentStep >= step ? "32px" : "28px",
                    height: currentStep >= step ? "32px" : "28px",
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor:
                      step < currentStep
                        ? "var(--green)"
                        : step === currentStep
                          ? "var(--green)"
                          : "var(--border2)",
                    background:
                      step < currentStep
                        ? "var(--green)"
                        : step === currentStep
                          ? "var(--green-light)"
                          : "var(--bg3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color:
                      step < currentStep
                        ? "#fff"
                        : step === currentStep
                          ? "var(--green)"
                          : "var(--muted)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color:
                      currentStep === step ? "var(--green)" : "var(--muted)",
                    marginTop: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step === 1 && "Info"}
                  {step === 2 && "Experience"}
                  {step === 3 && "Education"}
                  {step === 4 && "Skills"}
                  {step === 5 && "Finish"}
                </span>
              </div>
              {step < 5 && (
                <div
                  style={{
                    width: "40px",
                    height: "2px",
                    background:
                      step < currentStep ? "var(--green)" : "var(--border)",
                    margin: "0 8px",
                    marginBottom: "18px",
                    transition: "background 0.3s ease",
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Score and Tips Bar */}
        <div
          style={{
            position: "fixed",
            top: "155px",
            left: 0,
            right: 0,
            zIndex: 140,
            background: "#fff",
            borderBottom: "1px solid var(--border)",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Resume Score */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Score
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "60px",
                  height: "6px",
                  background: "var(--bg3)",
                  borderRadius: "100px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      progress >= 80
                        ? "var(--green)"
                        : progress >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                    borderRadius: "100px",
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color:
                    progress >= 80
                      ? "var(--green)"
                      : progress >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              >
                {progress}%
              </span>
            </div>
          </div>

          {/* Tips Button */}
          <button
            onClick={() => setShowTips(!showTips)}
            style={{
              background: "var(--green-light)",
              border: "1px solid var(--green-mid)",
              color: "var(--green)",
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "0.68rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            💡 Tips
          </button>
        </div>

        {/* Tips Modal */}
        {showTips && (
          <div
            onClick={() => setShowTips(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 500,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "16px",
                width: "90%",
                maxWidth: "420px",
                padding: "24px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {stepTips[currentStep as keyof typeof stepTips].title}
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ✓ Do's
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {stepTips[currentStep as keyof typeof stepTips].dos.map(
                    (tip: string, i: number) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text2)",
                          marginBottom: "8px",
                          paddingLeft: "14px",
                        }}
                      >
                        {tip}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#ef4444",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ✕ Don'ts
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {stepTips[currentStep as keyof typeof stepTips].donts.map(
                    (tip: string, i: number) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text2)",
                          marginBottom: "8px",
                          paddingLeft: "14px",
                        }}
                      >
                        {tip}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - with top margin for step bar */}
        <main
          style={{
            marginTop: "210px",
            flex: 1,
            padding: "44px 48px 120px",
            maxWidth: "780px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "8px",
                  }}
                >
                  Step 1 of 5
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: "6px",
                  }}
                >
                  Personal Information
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  This is the header of your CV - make sure your details are
                  accurate and professional.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                {/* Profile Picture */}
                <div
                  style={{
                    gridColumn: "span 2",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    background: "var(--bg2)",
                    borderRadius: "10px",
                    border: "1.5px dashed var(--border2)",
                  }}
                >
                  {formData.profilePicture ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={formData.profilePicture}
                        alt="Profile"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid var(--green)",
                        }}
                      />
                      <button
                        onClick={() => updateFormData("profilePicture", "")}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      style={{ fontSize: "0.75rem", color: "var(--muted)" }}
                    >
                      Add Photo
                    </span>
                  )}
                  <label
                    style={{
                      cursor: "pointer",
                      color: "var(--green)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {formData.profilePicture ? "Change" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateFormData(
                              "profilePicture",
                              reader.result as string,
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "var(--muted2)",
                      textAlign: "center",
                    }}
                  >
                    JPG, PNG. Max 2MB.
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                    placeholder="e.g. Amina"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="e.g. Mwangi"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    gridColumn: "span 2",
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Professional Title / Target Role *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => updateFormData("role", e.target.value)}
                    placeholder="e.g. Senior Software Developer"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    placeholder="Nairobi, Kenya"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => updateFormData("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    gridColumn: "span 2",
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Professional Summary{" "}
                    <span
                      style={{
                        color: "var(--muted2)",
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      (or let AI write this)
                    </span>
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => updateFormData("summary", e.target.value)}
                    rows={4}
                    placeholder="A brief 2-3 sentence overview of who you are, your experience, and what you bring to the role..."
                    style={{
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      color: "var(--text)",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      fontSize: "0.88rem",
                      width: "100%",
                      resize: "vertical",
                      minHeight: "96px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, var(--green-light), #f0fdf4)",
                  border: "1.5px solid var(--green-mid)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginTop: "32px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      marginBottom: "2px",
                    }}
                  >
                    ✨ Let AI write your summary
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Based on your role and experience, AI will generate a
                    compelling professional summary.
                  </div>
                </div>
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  style={{
                    background: "var(--green)",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {loading ? "Generating..." : "Generate Summary"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "8px",
                  }}
                >
                  Step 2 of 5
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: "6px",
                  }}
                >
                  Work Experience
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  Add your work history, most recent first. AI will enhance your
                  bullet points with measurable impact.
                </p>
              </div>

              {experience.map((exp, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "16px",
                    position: "relative",
                  }}
                >
                  {/* Wrapper Icon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "20px",
                      width: "28px",
                      height: "28px",
                      background: "var(--green-light)",
                      border: "1px solid var(--green-mid)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--green)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: collapsedExperience.includes(index)
                        ? "0"
                        : "20px",
                      paddingLeft: "10px",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      <span
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "var(--green-light)",
                          border: "1px solid var(--green-mid)",
                          color: "var(--green)",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                        }}
                      >
                        {index + 1}
                      </span>
                      {index === 0
                        ? "Most Recent Position"
                        : "Previous Position"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <button
                        onClick={() => toggleExperienceCollapse(index)}
                        style={{
                          background: "var(--bg2)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--muted)",
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                          fontWeight: 600,
                          lineHeight: 1,
                          minWidth: "22px",
                        }}
                        title={
                          collapsedExperience.includes(index)
                            ? "Expand"
                            : "Collapse"
                        }
                      >
                        {collapsedExperience.includes(index) ? "⌄" : "⌃"}
                      </button>
                      {experience.length > 1 && (
                        <button
                          onClick={() => removeExperience(index)}
                          style={{
                            background: "var(--bg2)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: "0.7rem",
                            padding: "4px 6px",
                            lineHeight: 1,
                            minWidth: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Remove"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {!collapsedExperience.includes(index) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                      }}
                    >
                      <div
                        style={{
                          gridColumn: "span 2",
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) =>
                            updateExperience(index, "jobTitle", e.target.value)
                          }
                          placeholder="e.g. Software Developer"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(index, "company", e.target.value)
                          }
                          placeholder="e.g. Safaricom PLC"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            updateExperience(index, "location", e.target.value)
                          }
                          placeholder="Nairobi, Kenya"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(index, "startDate", e.target.value)
                          }
                          placeholder="Jan 2022"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          End Date
                        </label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateExperience(index, "endDate", e.target.value)
                          }
                          placeholder="Present"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "span 2",
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Key Responsibilities & Achievements
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Describe what you did and the impact you made..."
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                            minHeight: "96px",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addExperience}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "1.5px dashed var(--border2)",
                  color: "var(--muted)",
                  padding: "13px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Another Position
              </button>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "8px",
                  }}
                >
                  Step 3 of 5
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: "6px",
                  }}
                >
                  Education
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  Add your academic qualifications, degrees, and certifications.
                </p>
              </div>

              {education.map((edu, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "16px",
                    position: "relative",
                  }}
                >
                  {/* Wrapper Icon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "20px",
                      width: "28px",
                      height: "28px",
                      background: "var(--green-light)",
                      border: "1px solid var(--green-mid)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--green)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: collapsedEducation.includes(index)
                        ? "0"
                        : "20px",
                      paddingLeft: "10px",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      <span
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "var(--green-light)",
                          border: "1px solid var(--green-mid)",
                          color: "var(--green)",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                        }}
                      >
                        {index + 1}
                      </span>
                      {index === 0
                        ? "Highest Qualification"
                        : "Additional Qualification"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <button
                        onClick={() => toggleEducationCollapse(index)}
                        style={{
                          background: "var(--bg2)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--muted)",
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                          fontWeight: 600,
                          lineHeight: 1,
                          minWidth: "22px",
                        }}
                        title={
                          collapsedEducation.includes(index)
                            ? "Expand"
                            : "Collapse"
                        }
                      >
                        {collapsedEducation.includes(index) ? "⌄" : "⌃"}
                      </button>
                      {education.length > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          style={{
                            background: "var(--bg2)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: "0.7rem",
                            padding: "4px 6px",
                            lineHeight: 1,
                            minWidth: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Remove"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {!collapsedEducation.includes(index) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                      }}
                    >
                      <div
                        style={{
                          gridColumn: "span 2",
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Degree / Qualification *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          placeholder="e.g. BSc Computer Science"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "institution",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. University of Nairobi"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Year Completed
                        </label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation(index, "year", e.target.value)
                          }
                          placeholder="e.g. 2021"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "span 2",
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--muted)",
                          }}
                        >
                          Achievements / Relevant Modules
                        </label>
                        <input
                          type="text"
                          value={edu.achievements}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "achievements",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. First Class Honours, Dean's List"
                          style={{
                            background: "#fff",
                            border: "1.5px solid var(--border)",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addEducation}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "1.5px dashed var(--border2)",
                  color: "var(--muted)",
                  padding: "13px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Another Qualification
              </button>
            </div>
          )}

          {/* Step 4: Skills */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "8px",
                  }}
                >
                  Step 4 of 5
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: "6px",
                  }}
                >
                  Skills
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  Add your technical and professional skills. Type a skill and
                  press <strong>Enter</strong> to add it.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "12px",
                      display: "block",
                    }}
                  >
                    Technical & Professional Skills
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      padding: "10px 12px",
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      minHeight: "52px",
                      cursor: "text",
                    }}
                    onClick={() =>
                      document.getElementById("skill-input")?.focus()
                    }
                  >
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "var(--green-light)",
                          border: "1px solid var(--green-mid)",
                          color: "var(--green)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--green)",
                            fontSize: "0.9rem",
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      id="skill-input"
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add skill and press Enter…"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "4px",
                        fontSize: "0.85rem",
                        minWidth: "140px",
                        flex: 1,
                        boxShadow: "none !important",
                        borderRadius: 0,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "12px",
                      display: "block",
                    }}
                  >
                    Languages
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      padding: "10px 12px",
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      minHeight: "52px",
                      cursor: "text",
                    }}
                    onClick={() =>
                      document.getElementById("lang-input")?.focus()
                    }
                  >
                    {formData.languages.map((lang) => (
                      <span
                        key={lang}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "var(--green-light)",
                          border: "1px solid var(--green-mid)",
                          color: "var(--green)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {lang}
                        <button
                          onClick={() => removeLanguage(lang)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--green)",
                            fontSize: "0.9rem",
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      id="lang-input"
                      type="text"
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                      placeholder="Add language…"
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "4px",
                        fontSize: "0.85rem",
                        minWidth: "120px",
                        flex: 1,
                        boxShadow: "none !important",
                        borderRadius: 0,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, var(--green-light), #f0fdf4)",
                  border: "1.5px solid var(--green-mid)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginTop: "28px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      marginBottom: "2px",
                    }}
                  >
                    ✨ Suggest skills for your role
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    AI recommends the most in-demand skills for your job title
                    and industry.
                  </div>
                </div>
                <button
                  onClick={suggestSkills}
                  disabled={loading}
                  style={{
                    background: "var(--green)",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Getting suggestions..." : "Suggest Skills"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Finalize & Payment */}
          {currentStep === 5 && (
            <div>
              <div style={{ marginBottom: "36px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--green)",
                    marginBottom: "8px",
                  }}
                >
                  Step 5 of 5
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    marginBottom: "6px",
                  }}
                >
                  Finalize & Preview
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                  }}
                >
                  Review your CV, run an ATS check, then pay to download your
                  completed document.
                </p>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg,var(--green-light),#f0fdf4)",
                  border: "1.5px solid var(--green-mid)",
                  borderRadius: "16px",
                  padding: "28px",
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                >
                  Ready to download your CV? 🎉
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    marginBottom: "20px",
                    fontWeight: 300,
                  }}
                >
                  Pay once via M-Pesa and get lifetime access - unlimited
                  downloads, forever.
                </div>

                {/* Offer Banner - Show if there's an active offer */}
                {activeOffer && !offerApplied && (
                  <div
                    style={{
                      background: activeOffer.banner
                        ? `url(${activeOffer.banner})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      color: "#fff",
                    }}
                  >
                    {!activeOffer.banner && (
                      <>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            marginBottom: "8px",
                          }}
                        >
                          {activeOffer.campaignName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            marginBottom: "12px",
                            opacity: 0.9,
                          }}
                        >
                          {activeOffer.description}
                        </div>
                      </>
                    )}
                    <button
                      onClick={handleApplyOffer}
                      style={{
                        background: "#fff",
                        color: activeOffer.banner ? "#333" : "#667eea",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {activeOffer.actionButton}
                    </button>
                  </div>
                )}

                {/* Show discounted price if offer is applied */}
                {offerApplied && activeOffer && (
                  <div
                    style={{
                      background: "#dcfce7",
                      border: "1px solid #16a34a",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Offer Applied!
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#16a34a",
                      }}
                    >
                      Ksh {calculatePrice()}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        textDecoration: "line-through",
                      }}
                    >
                      Was Ksh {basePrice}
                    </div>
                  </div>
                )}

                {paymentStep === "phone" && (
                  <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                    <div style={{ marginBottom: "14px", textAlign: "left" }}>
                      <label
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        M-Pesa Phone Number
                      </label>
                      <div
                        style={{
                          display: "flex",
                          background: "#fff",
                          border: "1.5px solid var(--border)",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 14px",
                            background: "var(--bg3)",
                            color: "var(--muted)",
                            fontSize: "0.88rem",
                            borderRight: "1px solid var(--border)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          🇰🇪 +254
                        </div>
                        <input
                          type="tel"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="712 345 678"
                          style={{
                            border: "none",
                            background: "transparent",
                            borderRadius: 0,
                            boxShadow: "none !important",
                            padding: "11px 14px",
                            fontSize: "0.88rem",
                            flex: 1,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={initiatePayment}
                      style={{
                        width: "100%",
                        background: "#4caf50",
                        color: "#fff",
                        padding: "15px",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      📲 Pay Ksh {calculatePrice()} via M-Pesa
                    </button>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted2)",
                        marginTop: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      An STK Push will be sent to your Safaricom number. Enter
                      your M-Pesa PIN to confirm.
                    </div>
                  </div>
                )}

                {paymentStep === "processing" && (
                  <div style={{ padding: "40px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        border: "3px solid var(--green-mid)",
                        borderTopColor: "var(--green)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto 16px",
                      }}
                    ></div>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                      Processing Payment...
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Check your phone for the M-Pesa prompt
                    </div>
                    <style>{`
                      @keyframes spin { to { transform: rotate(360deg); } }
                    `}</style>
                  </div>
                )}

                {paymentStep === "success" && (
                  <div>
                    <div
                      style={{
                        width: "84px",
                        height: "84px",
                        background: "var(--green-light)",
                        border: "2px solid var(--green-mid)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.4rem",
                        margin: "0 auto 24px",
                      }}
                    >
                      🎉
                    </div>
                    <div
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        marginBottom: "8px",
                      }}
                    >
                      Payment Confirmed!
                    </div>
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.9rem",
                        marginBottom: "32px",
                        fontWeight: 300,
                      }}
                    >
                      Your CV is permanently unlocked. Download it anytime,
                      forever - no expiry.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "var(--green)",
                          color: "#fff",
                          padding: "12px 22px",
                          borderRadius: "10px",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.83rem",
                          cursor: "pointer",
                        }}
                      >
                        📄 Download PDF
                      </button>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "var(--bg3)",
                          color: "var(--text2)",
                          padding: "12px 22px",
                          borderRadius: "10px",
                          border: "1.5px solid var(--border)",
                          fontWeight: 700,
                          fontSize: "0.83rem",
                          cursor: "pointer",
                        }}
                      >
                        📝 Download DOCX
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "24px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  marginBottom: "6px",
                }}
              >
                Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              ref={previewRef}
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "20px",
                minHeight: "400px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                {formData.firstName} {formData.lastName}
              </h3>
              <div
                style={{
                  fontSize: "1rem",
                  color: "var(--muted)",
                  marginBottom: "12px",
                }}
              >
                {formData.role}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text2)",
                  marginBottom: "20px",
                }}
              >
                {formData.summary || "Professional summary will appear here..."}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "var(--bg2)",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Contact
                  </h4>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: "0.85rem",
                    }}
                  >
                    <li
                      style={{
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Email:</strong> {formData.email || "Not provided"}
                    </li>
                    <li
                      style={{
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Phone:</strong> {formData.phone || "Not provided"}
                    </li>
                    <li
                      style={{
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Location:</strong>{" "}
                      {formData.location || "Not provided"}
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: "var(--bg2)",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Skills
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          background: "var(--green-light)",
                          border: "1px solid var(--green-mid)",
                          color: "var(--green)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: "var(--green)",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={downloadThumbnail}
                  style={{
                    background: "var(--bg3)",
                    color: "var(--text2)",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Download Thumbnail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep < 5 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border)",
            padding: "16px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {currentStep > 1 && (
              <button
                onClick={goPrev}
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--border2)",
                  color: "var(--muted)",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Back
              </button>
            )}
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--muted)",
              }}
            >
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <button
            onClick={goNext}
            style={{
              background: "var(--green)",
              color: "#fff",
              padding: "9px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
