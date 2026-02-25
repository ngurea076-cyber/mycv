"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import html2canvas from "html2canvas";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  cvCount: number;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@email.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    cvCount: 5,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@email.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-20",
    cvCount: 3,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@email.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-02-01",
    cvCount: 1,
  },
];

const mockPayments = [
  {
    id: "1",
    user: "Jane Smith",
    amount: 100,
    status: "completed",
    date: "2024-02-20",
  },
  {
    id: "2",
    user: "David Brown",
    amount: 100,
    status: "completed",
    date: "2024-02-19",
  },
  {
    id: "3",
    user: "Mike Johnson",
    amount: 100,
    status: "pending",
    date: "2024-02-18",
  },
];

const mockTemplates = [
  {
    id: "1",
    name: "Modern Professional",
    category: "Professional",
    downloads: 1250,
    status: "active",
    description: "A clean and professional CV template",
    type: "resume",
    thumbnail: "",
    code: "",
  },
  {
    id: "2",
    name: "Creative Designer",
    category: "Creative",
    downloads: 890,
    status: "active",
    description: "A creative CV template for designers",
    type: "resume",
    thumbnail: "",
    code: "",
  },
  {
    id: "3",
    name: "Professional Cover Letter",
    category: "Professional",
    downloads: 450,
    status: "active",
    description: "Professional cover letter template",
    type: "coverletter",
    thumbnail: "",
    code: "",
  },
  {
    id: "4",
    name: "Creative Portfolio",
    category: "Creative",
    downloads: 670,
    status: "active",
    description: "Creative portfolio showcase template",
    type: "portfolio",
    thumbnail: "",
    code: "",
  },
  {
    id: "5",
    name: "Minimalist Cover Letter",
    category: "Minimalist",
    downloads: 320,
    status: "inactive",
    description: "Minimalist cover letter template",
    type: "coverletter",
    thumbnail: "",
    code: "",
  },
  {
    id: "6",
    name: "Executive Portfolio",
    category: "Executive",
    downloads: 540,
    status: "active",
    description: "Executive portfolio template",
    type: "portfolio",
    thumbnail: "",
    code: "",
  },
];

const mockTestimonials = [
  {
    id: "1",
    name: "Emily Chen",
    role: "Engineer",
    company: "Tech Corp",
    content: "Great tool!",
    avatar: "EC",
    is_active: true,
  },
  {
    id: "2",
    name: "Robert Kimani",
    role: "Manager",
    company: "Brand",
    content: "Best builder!",
    avatar: "RK",
    is_active: true,
  },
];

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  is_active: boolean;
}

type TabType =
  | "users"
  | "payments"
  | "templates"
  | "testimonials"
  | "template-builder"
  | "settings";

export default function AdminPage() {
  // Payment analytics data - sample data for graph
  const paymentAnalyticsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Payments (KSh)",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Number of Transactions",
        data: [120, 190, 150, 250, 220, 300],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Calculate payment statistics
  const totalRevenue = 123000;
  const totalTransactions = 1230;
  const completedPayments = mockPayments.filter(
    (p) => p.status === "completed",
  ).length;
  const pendingPayments = mockPayments.filter(
    (p) => p.status === "pending",
  ).length;

  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [templateCode, setTemplateCode] = useState(
    '<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff;"><h1 style="color: #1a1a1a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">{{name}}</h1><p style="color: #666; margin-top: 10px;">{{email}} | {{phone}}</p><p style="color: #666; margin-top: 20px;">{{summary}}</p><h2 style="color: #1a1a1a; margin-top: 30px;">Experience</h2><p><strong>{{job_title}}</strong> at {{company}}</p><p style="color: #666; font-size: 14px;">{{duration}}</p><h2 style="color: #1a1a1a; margin-top: 20px;">Education</h2><p><strong>{{education}}</strong></p><p style="color: #666; font-size: 14px;">{{school}}</p><h2 style="color: #1a1a1a; margin-top: 20px;">Skills</h2><p style="color: #666;">{{skills}}</p></div>',
  );
  const [templates, setTemplates] = useState(mockTemplates);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState("resume"); // resume, portfolio, coverletter
  const [templateCategory, setTemplateCategory] = useState("");
  const [templateThumbnail, setTemplateThumbnail] = useState<string>("");
  const [showTemplateCodeInput, setShowTemplateCodeInput] = useState(false);
  const [templateModalCode, setTemplateModalCode] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateView, setTemplateView] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(mockTestimonials);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<
    string | null
  >(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    avatar: "",
    is_active: false,
  });

  // Offers state
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [offers, setOffers] = useState([
    {
      id: "1",
      banner: "",
      campaignName: "First Purchase Deal",
      description: "Get a great discount on your first CV!",
      actionButton: "30% Off First CV Purchase!",
      discountType: "percentage",
      discountValue: 30,
      targetProduct: "cv",
      condition: "first_purchase",
      isActive: true,
    },
  ]);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState({
    banner: "",
    campaignName: "",
    description: "",
    actionButton: "",
    discountType: "percentage",
    discountValue: 30,
    targetProduct: "cv",
    condition: "first_purchase",
    isActive: false,
  });

  // Load offers from localStorage on mount
  useEffect(() => {
    const savedOffers = localStorage.getItem("offers");
    if (savedOffers) {
      try {
        setOffers(JSON.parse(savedOffers));
      } catch (e) {
        console.error("Error loading offers from localStorage:", e);
      }
    }
  }, []);

  // Save offers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("offers", JSON.stringify(offers));
  }, [offers]);

  const getStatusColor = (status: string) => {
    if (status === "active") return { bg: "#dcfce7", color: "#16a34a" };
    if (status === "inactive") return { bg: "#fee2e2", color: "#dc2626" };
    if (status === "pending") return { bg: "#fef3c7", color: "#d97706" };
    if (status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
    return { bg: "#f3f4f6", color: "#6b7280" };
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(templateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadThumbnail = async () => {
    try {
      const sourceEl = previewRef.current;
      if (!sourceEl) {
        alert("No preview to download. Switch to Preview mode first.");
        return;
      }

      // Create a container with A4 dimensions (210mm x 297mm = 794px x 1122px at 96 DPI)
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "-9999px";
      wrapper.style.width = "794px";
      wrapper.style.height = "auto";
      wrapper.style.background = "#ffffff";
      wrapper.style.boxSizing = "border-box";
      wrapper.style.padding = "40px";
      wrapper.style.fontFamily = "Arial, sans-serif";
      wrapper.style.fontSize = "14px";
      wrapper.style.color = "#000";
      wrapper.style.lineHeight = "1.5";

      // Clone the preview content
      const clone = sourceEl.cloneNode(true) as HTMLElement;
      clone.style.width = "100%";
      clone.style.boxSizing = "border-box";

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the content
      const canvas = await html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        windowHeight: wrapper.scrollHeight,
      });

      // Convert to image and download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `cv-template-a4-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      document.body.removeChild(wrapper);
    } catch (err) {
      console.error("Download error:", err);
      // Fallback: download as HTML
      try {
        const renderedHtml = renderTemplate(templateCode);
        const a4Html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page { size: A4; margin: 0; } body { width: 210mm; min-height: 297mm; margin: 0; padding: 40px; font-family: Arial, sans-serif; box-sizing: border-box; }</style></head><body>${renderedHtml}</body></html>`;
        const blob = new Blob([a4Html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cv-template-a4-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (fallbackErr) {
        alert("Download failed. Please try again.");
      }
    }
  };

  const sampleData = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+254 712 345 678",
    summary:
      "Experienced software developer with 5+ years of experience in building web applications.",
    job_title: "Senior Software Developer",
    company: "Tech Solutions Ltd",
    duration: "2020 - Present",
    education: "Bachelor of Science in Computer Science",
    school: "University of Nairobi",
    skills: "JavaScript, React, Node.js, Python, SQL",
  };

  const renderTemplate = (code: string) => {
    let rendered = code;
    Object.entries(sampleData).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return rendered;
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
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
          <span
            style={{
              color: "var(--muted)",
              fontWeight: 400,
              marginLeft: "8px",
            }}
          >
            Admin
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Welcome, Admin
          </span>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--green)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            A
          </div>
        </div>
      </div>

      <div style={{ display: "flex", paddingTop: "60px" }}>
        <div
          style={{
            width: "240px",
            minHeight: "calc(100vh - 60px)",
            background: "#fff",
            borderRight: "1px solid var(--border)",
            padding: "32px 16px",
            position: "fixed",
            top: "60px",
            left: 0,
            bottom: 0,
            overflowY: "auto",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <NavItem
              id="users"
              label="Users"
              active={activeTab}
              onClick={() => setActiveTab("users")}
              icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
            />
            <NavItem
              id="payments"
              label="Payments"
              active={activeTab}
              onClick={() => setActiveTab("payments")}
              icon="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            />
            <NavItem
              id="templates"
              label="Templates"
              active={activeTab}
              onClick={() => setActiveTab("templates")}
              icon="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <NavItem
              id="testimonials"
              label="Testimonials"
              active={activeTab}
              onClick={() => setActiveTab("testimonials")}
              icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
            <NavItem
              id="template-builder"
              label="Template Builder"
              active={activeTab}
              onClick={() => setActiveTab("template-builder")}
              icon="M12 2L2 7l10 5 10-5-10-5z"
            />
            <NavItem
              id="settings"
              label="Settings"
              active={activeTab}
              onClick={() => setActiveTab("settings")}
              icon="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
            />
          </nav>
        </div>

        <main style={{ marginLeft: "240px", flex: 1, padding: "32px 48px" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              marginBottom: "24px",
            }}
          >
            {activeTab === "users" && "User Management"}
            {activeTab === "payments" && "Payment Analytics"}
            {activeTab === "templates" && "Templates"}
            {activeTab === "testimonials" && "Testimonials"}
            {activeTab === "template-builder" && "Template Builder"}
            {activeTab === "settings" && "Settings"}
          </h1>

          {activeTab === "users" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--bg)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      CVs
                    </th>
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => {
                    const s = getStatusColor(user.status);
                    return (
                      <tr
                        key={user.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={{ padding: "14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "var(--green-light)",
                                color: "var(--green)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                              }}
                            >
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.name}</div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--muted)",
                                }}
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background:
                                user.role === "admin" ? "#dbeafe" : "#f3f4f6",
                              color:
                                user.role === "admin" ? "#2563eb" : "#4b5563",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: s.bg,
                              color: s.color,
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px", fontWeight: 600 }}>
                          {user.cvCount}
                        </td>
                        <td style={{ padding: "14px", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              background: "#fff",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              {/* Payment Analytics Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "8px",
                    }}
                  >
                    Total Revenue
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#16a34a",
                    }}
                  >
                    KSh {totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "8px",
                    }}
                  >
                    Total Transactions
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#2563eb",
                    }}
                  >
                    {totalTransactions}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "8px",
                    }}
                  >
                    Completed
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#16a34a",
                    }}
                  >
                    {completedPayments}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: "8px",
                    }}
                  >
                    Pending
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#d97706",
                    }}
                  >
                    {pendingPayments}
                  </div>
                </div>
              </div>

              {/* Analytics Graph */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "20px",
                  }}
                >
                  Payment Trends
                </h3>
                <div style={{ height: "300px" }}>
                  <Line data={paymentAnalyticsData} options={chartOptions} />
                </div>
              </div>

              {/* Payment Transactions Table */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        User
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.map((p) => {
                      const s = getStatusColor(p.status);
                      return (
                        <tr
                          key={p.id}
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td style={{ padding: "14px", fontWeight: 600 }}>
                            {p.user}
                          </td>
                          <td
                            style={{
                              padding: "14px",
                              fontWeight: 700,
                              color: "#16a34a",
                            }}
                          >
                            KSh {p.amount}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: s.bg,
                                color: s.color,
                              }}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td
                            style={{ padding: "14px", color: "var(--muted)" }}
                          >
                            {p.date}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div>
              {/* Create Template Button and Sort Buttons */}
              <div
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCreateModalOpen(true);
                    setTemplateName("");
                    setTemplateDescription("");
                    setTemplateType("resume");
                    setTemplateCategory("");
                    setTemplateThumbnail("");
                    setShowTemplateCodeInput(false);
                    setTemplateModalCode("");
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    padding: "10px 24px",
                    background: "var(--green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  + Create New Template
                </button>

                {/* Search Input */}
                <div
                  style={{
                    position: "relative",
                    flex: "1",
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--muted)",
                    }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>

              {/* Templates Table */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Template
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Category
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Downloads
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates
                      .filter((t) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          t.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          (t.category &&
                            t.category
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()));
                        return matchesSearch;
                      })
                      .map((t) => {
                        const s = getStatusColor(t.status);
                        return (
                          <tr
                            key={t.id}
                            style={{ borderBottom: "1px solid var(--border)" }}
                          >
                            <td style={{ padding: "14px", fontWeight: 600 }}>
                              {t.name}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  background: "#f3f4f6",
                                }}
                              >
                                {t.category}
                              </span>
                            </td>
                            <td style={{ padding: "14px", fontWeight: 600 }}>
                              {t.downloads}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  background: s.bg,
                                  color: s.color,
                                }}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "14px",
                                display: "flex",
                                gap: "8px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingTemplateId(t.id);
                                  setTemplateName(t.name);
                                  setTemplateDescription(t.description || "");
                                  setTemplateType(t.type || "resume");
                                  setTemplateCategory(t.category || "");
                                  setTemplateThumbnail(t.thumbnail || "");
                                  setShowTemplateCodeInput(false);
                                  setTemplateModalCode(t.code || "");
                                  setIsEditModalOpen(true);
                                }}
                                title="Edit"
                                style={{
                                  padding: "6px 8px",
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const newStatus =
                                    t.status === "active"
                                      ? "inactive"
                                      : "active";
                                  const action =
                                    t.status === "active"
                                      ? "Deactivate"
                                      : "Activate";
                                  if (confirm(`${action} "${t.name}"?`)) {
                                    setTemplates(
                                      templates.map((tmpl) =>
                                        tmpl.id === t.id
                                          ? { ...tmpl, status: newStatus }
                                          : tmpl,
                                      ),
                                    );
                                  }
                                }}
                                title={
                                  t.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                style={{
                                  padding: "6px 8px",
                                  background:
                                    t.status === "active"
                                      ? "#f59e0b"
                                      : "#10b981",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {t.status === "active" ? (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (confirm(`Delete "${t.name}"?`)) {
                                    setTemplates(
                                      templates.filter(
                                        (tmpl) => tmpl.id !== t.id,
                                      ),
                                    );
                                  }
                                }}
                                title="Delete"
                                style={{
                                  padding: "6px 8px",
                                  background: "#dc2626",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Template Modal */}
          {isCreateModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCreateModalOpen(false);
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "32px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  zIndex: 2001,
                  position: "relative",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "24px",
                    color: "var(--text)",
                  }}
                >
                  Create New Template
                </h2>

                {/* Template Type */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Template Type
                  </label>
                  <select
                    value={templateType}
                    onChange={(e) => {
                      setTemplateType(e.target.value);
                      if (e.target.value !== "resume") {
                        setTemplateCategory("");
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="resume">Resume/CV</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="coverletter">Cover Letter</option>
                  </select>
                </div>

                {/* Title */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Modern Professional CV"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe your template..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      minHeight: "80px",
                      fontFamily: "Arial, sans-serif",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Category - Only for Resume/CV */}
                {templateType === "resume" && (
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "6px",
                        color: "var(--text)",
                      }}
                    >
                      Category
                    </label>
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="">Select Category</option>
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="classic">Classic</option>
                    </select>
                  </div>
                )}

                {/* Thumbnail Image */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setTemplateThumbnail(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                    }}
                  />
                  {templateThumbnail && (
                    <div
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        height: "150px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <img
                        src={templateThumbnail}
                        alt="Thumbnail preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Template Code Toggle */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      justifyContent: "space-between",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      Add Template Code
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTemplateCodeInput(!showTemplateCodeInput);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        width: "50px",
                        height: "28px",
                        background: showTemplateCodeInput
                          ? "var(--green)"
                          : "var(--border)",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "24px",
                          height: "24px",
                          background: "#fff",
                          borderRadius: "50%",
                          top: "2px",
                          left: showTemplateCodeInput ? "24px" : "2px",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Template Code Input */}
                {showTemplateCodeInput && (
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "6px",
                        color: "var(--text)",
                      }}
                    >
                      Template Code (HTML/CSS)
                    </label>
                    <textarea
                      value={templateModalCode}
                      onChange={(e) => setTemplateModalCode(e.target.value)}
                      placeholder="Paste your HTML template code here. Use {{variable}} for dynamic content."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        boxSizing: "border-box",
                        minHeight: "150px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                )}

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCreateModalOpen(false);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        templateName.trim() &&
                        (templateType === "resume" ? templateCategory : true)
                      ) {
                        alert(
                          `Template "${templateName}" created successfully!`,
                        );
                        setIsCreateModalOpen(false);
                        setTemplateName("");
                        setTemplateDescription("");
                        setTemplateType("resume");
                        setTemplateCategory("");
                        setTemplateThumbnail("");
                        setShowTemplateCodeInput(false);
                        setTemplateModalCode("");
                      } else {
                        alert("Please fill in all required fields.");
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Template Modal */}
          {isEditModalOpen && editingTemplateId && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditModalOpen(false);
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "32px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  zIndex: 2001,
                  position: "relative",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "24px",
                    color: "var(--text)",
                  }}
                >
                  Edit Template
                </h2>

                {/* Title */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Modern Professional CV"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe this template..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      minHeight: "80px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Thumbnail Upload */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setTemplateThumbnail(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                  {templateThumbnail && (
                    <div style={{ marginTop: "12px" }}>
                      <img
                        src={templateThumbnail}
                        alt="Thumbnail preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Template Code Toggle and Editor */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      Template Code
                    </label>
                    <input
                      type="checkbox"
                      checked={showTemplateCodeInput}
                      onChange={(e) =>
                        setShowTemplateCodeInput(e.target.checked)
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  {showTemplateCodeInput && (
                    <textarea
                      value={templateModalCode}
                      onChange={(e) => setTemplateModalCode(e.target.value)}
                      placeholder="Paste your template HTML code here..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                        minHeight: "120px",
                        fontFamily: "'Courier New', monospace",
                        resize: "vertical",
                      }}
                    />
                  )}
                </div>

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditModalOpen(false);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (templateName.trim()) {
                        setTemplates(
                          templates.map((tmpl) =>
                            tmpl.id === editingTemplateId
                              ? {
                                  ...tmpl,
                                  name: templateName,
                                  description: templateDescription,
                                  thumbnail: templateThumbnail,
                                  code: templateModalCode,
                                  type: templateType,
                                  category: templateCategory,
                                }
                              : tmpl,
                          ),
                        );
                        alert("Template updated successfully!");
                        setIsEditModalOpen(false);
                        setEditingTemplateId(null);
                      } else {
                        alert("Please enter a template name.");
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Update Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Testimonial Create/Edit Modal */}
          {isTestimonialModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTestimonialModalOpen(false);
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "32px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  zIndex: 2001,
                  position: "relative",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "24px",
                    color: "var(--text)",
                  }}
                >
                  {editingTestimonialId
                    ? "Edit Testimonial"
                    : "Create New Testimonial"}
                </h2>

                {/* Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., John Doe"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Role */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Role
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        role: e.target.value,
                      })
                    }
                    placeholder="e.g., Software Engineer"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Company */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.company}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        company: e.target.value,
                      })
                    }
                    placeholder="e.g., Tech Corp"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Content *
                  </label>
                  <textarea
                    value={testimonialForm.content}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter the testimonial content..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      minHeight: "100px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Avatar */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Avatar (Initials)
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.avatar}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        avatar: e.target.value,
                      })
                    }
                    placeholder="e.g., JD"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    Leave empty to auto-generate from name
                  </p>
                </div>

                {/* Active Toggle */}
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        Show on Frontend
                      </label>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        Active testimonials (
                        {testimonials.filter((t) => t.is_active).length}/7) will
                        appear on the website
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newValue = !testimonialForm.is_active;
                        if (newValue) {
                          const activeCount = testimonials.filter(
                            (t) => t.is_active,
                          ).length;
                          if (activeCount >= 7) {
                            alert(
                              "Maximum 7 testimonials can be active at a time. Please deactivate one first.",
                            );
                            return;
                          }
                        }
                        setTestimonialForm({
                          ...testimonialForm,
                          is_active: newValue,
                        });
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        width: "50px",
                        height: "28px",
                        background: testimonialForm.is_active
                          ? "var(--green)"
                          : "var(--border)",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "24px",
                          height: "24px",
                          background: "#fff",
                          borderRadius: "50%",
                          top: "2px",
                          left: testimonialForm.is_active ? "24px" : "2px",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTestimonialModalOpen(false);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (
                        !testimonialForm.name.trim() ||
                        !testimonialForm.content.trim()
                      ) {
                        alert("Please fill in name and content.");
                        return;
                      }

                      const avatar =
                        testimonialForm.avatar ||
                        testimonialForm.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                      if (editingTestimonialId) {
                        // Update existing testimonial
                        setTestimonials(
                          testimonials.map((t) =>
                            t.id === editingTestimonialId
                              ? { ...t, ...testimonialForm, avatar }
                              : t,
                          ),
                        );
                        alert("Testimonial updated successfully!");
                      } else {
                        // Create new testimonial
                        const newTestimonial = {
                          id: Date.now().toString(),
                          ...testimonialForm,
                          avatar,
                        };
                        setTestimonials([newTestimonial, ...testimonials]);
                        alert("Testimonial created successfully!");
                      }

                      setIsTestimonialModalOpen(false);
                      setEditingTestimonialId(null);
                      setTestimonialForm({
                        name: "",
                        role: "",
                        company: "",
                        content: "",
                        avatar: "",
                        is_active: false,
                      });
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {editingTestimonialId
                      ? "Update Testimonial"
                      : "Create Testimonial"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "testimonials" && (
            <div>
              {/* Create Testimonial Button */}
              <div style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingTestimonialId(null);
                    setTestimonialForm({
                      name: "",
                      role: "",
                      company: "",
                      content: "",
                      avatar: "",
                      is_active: false,
                    });
                    setIsTestimonialModalOpen(true);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    padding: "10px 24px",
                    background: "var(--green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Create New Testimonial
                </button>
              </div>

              {/* Active Testimonials Count */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  background: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#166534",
                  }}
                >
                  Active Testimonials:{" "}
                  {testimonials.filter((t) => t.is_active).length} / 7
                </span>
              </div>

              {/* Testimonials Table */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        User
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Content
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map((t) => {
                      const s = getStatusColor(
                        t.is_active ? "active" : "inactive",
                      );
                      return (
                        <tr
                          key={t.id}
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "var(--green-light)",
                                  color: "var(--green)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {t.avatar}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{t.name}</div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--muted)",
                                  }}
                                >
                                  {t.role} {t.company && `at ${t.company}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px", maxWidth: "300px" }}>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.content}
                            </div>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: s.bg,
                                color: s.color,
                              }}
                            >
                              {t.is_active ? "active" : "inactive"}
                            </span>
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingTestimonialId(t.id);
                                  setTestimonialForm({
                                    name: t.name,
                                    role: t.role || "",
                                    company: t.company || "",
                                    content: t.content,
                                    avatar: t.avatar || "",
                                    is_active: t.is_active,
                                  });
                                  setIsTestimonialModalOpen(true);
                                }}
                                title="Edit"
                                style={{
                                  padding: "6px 8px",
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const newStatus = !t.is_active;
                                  const action = newStatus
                                    ? "Activate"
                                    : "Deactivate";

                                  if (newStatus) {
                                    const activeCount = testimonials.filter(
                                      (tm) => tm.is_active,
                                    ).length;
                                    if (activeCount >= 7) {
                                      alert(
                                        "Maximum 7 testimonials can be active at a time. Please deactivate one first.",
                                      );
                                      return;
                                    }
                                  }

                                  if (confirm(`${action} "${t.name}"?`)) {
                                    setTestimonials(
                                      testimonials.map((tm) =>
                                        tm.id === t.id
                                          ? { ...tm, is_active: newStatus }
                                          : tm,
                                      ),
                                    );
                                  }
                                }}
                                title={t.is_active ? "Deactivate" : "Activate"}
                                style={{
                                  padding: "6px 8px",
                                  background: t.is_active
                                    ? "#f59e0b"
                                    : "#10b981",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {t.is_active ? (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (confirm(`Delete "${t.name}"?`)) {
                                    setTestimonials(
                                      testimonials.filter(
                                        (tm) => tm.id !== t.id,
                                      ),
                                    );
                                  }
                                }}
                                title="Delete"
                                style={{
                                  padding: "6px 8px",
                                  background: "#dc2626",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Setup Offers Modal */}
          {isOffersModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOffersModalOpen(false);
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "32px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  zIndex: 2001,
                  position: "relative",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "24px",
                    color: "var(--text)",
                  }}
                >
                  Setup Offers
                </h2>

                {/* Banner Image */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setOfferForm({
                            ...offerForm,
                            banner: event.target?.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                    }}
                  />
                  {offerForm.banner && (
                    <div
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        height: "150px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <img
                        src={offerForm.banner}
                        alt="Banner preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Campaign Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={offerForm.campaignName}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        campaignName: e.target.value,
                      })
                    }
                    placeholder="e.g., Summer Sale"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={offerForm.description}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your offer..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      minHeight: "80px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Target Product */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Target Product
                  </label>
                  <select
                    value={offerForm.targetProduct}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        targetProduct: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="cv">CV/Resume</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Condition */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Condition
                  </label>
                  <select
                    value={offerForm.condition}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        condition: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="first_purchase">First Time Purchase</option>
                    <option value="second_purchase">
                      Second Time Purchase (Returning Customer)
                    </option>
                    <option value="open_to_all">Open to All</option>
                  </select>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    Who is this offer available to?
                  </p>
                </div>

                {/* Discount Type and Value */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Discount
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <select
                      value={offerForm.discountType}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          discountType: e.target.value,
                        })
                      }
                      style={{
                        width: "120px",
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <input
                      type="number"
                      value={offerForm.discountValue}
                      onChange={(e) =>
                        setOfferForm({
                          ...offerForm,
                          discountValue: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder={
                        offerForm.discountType === "percentage" ? "30" : "500"
                      }
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                        color: "var(--muted)",
                      }}
                    >
                      {offerForm.discountType === "percentage" ? "%" : "KES"}
                    </span>
                  </div>
                </div>

                {/* Action Button Text */}
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text)",
                    }}
                  >
                    Action Button Text
                  </label>
                  <input
                    type="text"
                    value={offerForm.actionButton}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        actionButton: e.target.value,
                      })
                    }
                    placeholder="e.g., 30% Off First CV Purchase!"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    Example: "30% Off First CV", "20% Off Second Resume"
                  </p>
                </div>

                {/* Active Toggle */}
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        Activate Offer
                      </label>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        This offer will be displayed on the website
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOfferForm({
                          ...offerForm,
                          isActive: !offerForm.isActive,
                        });
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        width: "50px",
                        height: "28px",
                        background: offerForm.isActive
                          ? "var(--green)"
                          : "var(--border)",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "24px",
                          height: "24px",
                          background: "#fff",
                          borderRadius: "50%",
                          top: "2px",
                          left: offerForm.isActive ? "24px" : "2px",
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOffersModalOpen(false);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!offerForm.campaignName.trim()) {
                        alert("Please enter a campaign name.");
                        return;
                      }

                      const newOffer = {
                        id: editingOfferId || Date.now().toString(),
                        banner: offerForm.banner,
                        campaignName: offerForm.campaignName,
                        description: offerForm.description,
                        actionButton: offerForm.actionButton,
                        discountType: offerForm.discountType,
                        discountValue: offerForm.discountValue,
                        targetProduct: offerForm.targetProduct,
                        condition: offerForm.condition,
                        isActive: offerForm.isActive,
                      };

                      if (editingOfferId) {
                        // Update existing offer
                        setOffers(
                          offers.map((o) =>
                            o.id === editingOfferId ? newOffer : o,
                          ),
                        );
                        alert(
                          `Offer "${offerForm.campaignName}" has been updated!`,
                        );
                      } else {
                        // Add new offer
                        setOffers([...offers, newOffer]);
                        alert(
                          `Offer "${offerForm.campaignName}" has been ${offerForm.isActive ? "activated" : "saved"}!`,
                        );
                      }

                      setIsOffersModalOpen(false);
                      setEditingOfferId(null);
                      setOfferForm({
                        banner: "",
                        campaignName: "",
                        description: "",
                        actionButton: "",
                        discountType: "percentage",
                        discountValue: 30,
                        targetProduct: "cv",
                        condition: "first_purchase",
                        isActive: false,
                      });
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {editingOfferId
                      ? "Update Offer"
                      : offerForm.isActive
                        ? "Activate Offer"
                        : "Save Offer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "template-builder" && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="region"
              aria-label="Template Builder"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 200px)",
                zIndex: 1,
              }}
            >
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTemplateView("code");
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background:
                      templateView === "code" ? "var(--green)" : "#fff",
                    color: templateView === "code" ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    position: "relative",
                    zIndex: 10,
                    pointerEvents: "auto",
                  }}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTemplateView("preview");
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background:
                      templateView === "preview" ? "var(--green)" : "#fff",
                    color: templateView === "preview" ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    position: "relative",
                    zIndex: 10,
                    pointerEvents: "auto",
                  }}
                >
                  Preview
                </button>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownloadThumbnail();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                    zIndex: 10,
                    pointerEvents: "auto",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Thumbnail
                </button>
              </div>

              {templateView === "code" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        background: "#1e1e1e",
                        borderRadius: "12px 12px 0 0",
                        padding: "10px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#ccc",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        HTML/CSS Code
                      </span>
                      <span style={{ color: "#666", fontSize: "0.7rem" }}>
                        Use {"{{variable}}"} for dynamic content
                      </span>
                    </div>
                    <textarea
                      value={templateCode}
                      onChange={(e) => setTemplateCode(e.target.value)}
                      style={{
                        flex: 1,
                        background: "#1e1e1e",
                        color: "#d4d4d4",
                        border: "none",
                        borderRadius: "0 0 12px 12px",
                        padding: "16px",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        resize: "none",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      padding: "14px",
                      background: copied ? "#16a34a" : "var(--green)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              )}

              {templateView === "preview" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--bg)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--muted)",
                      }}
                    >
                      Live Preview
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "20px",
                      overflow: "auto",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      ref={previewRef}
                      dangerouslySetInnerHTML={{
                        __html: renderTemplate(templateCode),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: "20px",
                }}
              >
                Pricing Settings
              </h3>
              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "var(--muted)",
                    }}
                  >
                    Currency
                  </label>
                  <select
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      padding: "10px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option>KES - Kenyan Shilling</option>
                    <option>USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "var(--muted)",
                    }}
                  >
                    CV/Resume Price (KES)
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      padding: "10px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "var(--muted)",
                    }}
                  >
                    Portfolio Price (KES)
                  </label>
                  <input
                    type="number"
                    defaultValue="150"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      padding: "10px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <button
                  style={{
                    padding: "12px 24px",
                    background: "var(--green)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                >
                  Save Settings
                </button>
                <button
                  onClick={() => {
                    setEditingOfferId(null);
                    setOfferForm({
                      banner: "",
                      campaignName: "",
                      description: "",
                      actionButton: "",
                      discountType: "percentage",
                      discountValue: 30,
                      targetProduct: "cv",
                      condition: "first_purchase",
                      isActive: false,
                    });
                    setIsOffersModalOpen(true);
                  }}
                  style={{
                    padding: "12px 24px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                >
                  + Create New Offer
                </button>

                {/* Active Offers Summary */}
                {offers.length > 0 && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "16px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#166534",
                      }}
                    >
                      Offers: {offers.filter((o) => o.isActive).length} active,{" "}
                      {offers.length} total
                    </span>
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "#fff",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{ fontSize: "0.85rem", fontWeight: 500 }}
                            >
                              {offer.campaignName} - {offer.actionButton}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "2px 8px",
                                  background: offer.isActive
                                    ? "#dcfce7"
                                    : "#f3f4f6",
                                  color: offer.isActive ? "#16a34a" : "#6b7280",
                                  borderRadius: "4px",
                                }}
                              >
                                {offer.isActive ? "Active" : "Inactive"}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "2px 8px",
                                  background: "#dbeafe",
                                  color: "#2563eb",
                                  borderRadius: "4px",
                                }}
                              >
                                {offer.condition === "first_purchase"
                                  ? "First Purchase"
                                  : offer.condition === "second_purchase"
                                    ? "Second Purchase"
                                    : "Open to All"}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => {
                                setEditingOfferId(offer.id);
                                setOfferForm({
                                  banner: offer.banner,
                                  campaignName: offer.campaignName,
                                  description: offer.description,
                                  actionButton: offer.actionButton,
                                  discountType: offer.discountType,
                                  discountValue: offer.discountValue,
                                  targetProduct: offer.targetProduct,
                                  condition: offer.condition,
                                  isActive: offer.isActive,
                                });
                                setIsOffersModalOpen(true);
                              }}
                              style={{
                                padding: "4px 8px",
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(`Delete "${offer.campaignName}"?`)
                                ) {
                                  setOffers(
                                    offers.filter((o) => o.id !== offer.id),
                                  );
                                }
                              }}
                              style={{
                                padding: "4px 8px",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "480px",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--green-light)",
                    color: "var(--green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {selectedUser.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                X
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    marginBottom: "4px",
                  }}
                >
                  Role
                </div>
                <div style={{ fontWeight: 600 }}>{selectedUser.role}</div>
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </div>
                <div style={{ fontWeight: 600 }}>{selectedUser.status}</div>
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    marginBottom: "4px",
                  }}
                >
                  CVs Created
                </div>
                <div style={{ fontWeight: 600 }}>{selectedUser.cvCount}</div>
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "var(--bg)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    marginBottom: "4px",
                  }}
                >
                  Member Since
                </div>
                <div style={{ fontWeight: 600 }}>{selectedUser.createdAt}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Close
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "var(--green)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({
  id,
  label,
  active,
  onClick,
  icon,
}: {
  id: string;
  label: string;
  active: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        background: "transparent",
        color: active === id ? "var(--green)" : "var(--muted)",
        fontWeight: active === id ? 600 : 500,
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d={icon}></path>
      </svg>
      {label}
    </div>
  );
}
