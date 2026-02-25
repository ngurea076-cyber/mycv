"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Order {
  id: string;
  date: string;
  product: string;
  type: "resume" | "cover_letter" | "portfolio";
  amount: number;
  status: "completed" | "pending";
  thumbnail?: string;
  pdfUrl?: string;
}

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  action_link: string;
  qualification_type:
    | "all"
    | "new_user"
    | "no_orders"
    | "min_orders"
    | "has_subscription";
  qualification_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
  qualification_type?: string;
  qualification_value?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [userOrderCount, setUserOrderCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "resume" | "cover_letter" | "portfolio"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showModal, setShowModal] = useState(false);

  // Fetch offers from API
  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    }
  };

  // Convert offers to banners format
  const banners: Banner[] = offers.map((offer) => ({
    id: offer.id,
    image: offer.image_url,
    title: offer.title,
    subtitle: offer.subtitle,
    link: offer.action_link,
    qualification_type: offer.qualification_type,
    qualification_value: offer.qualification_value,
  }));

  // Check if user qualifies for an offer
  const checkQualification = (
    qualificationType: string,
    qualificationValue?: number,
  ): boolean => {
    switch (qualificationType) {
      case "all":
        return true;
      case "new_user":
        return (
          !user?.createdAt ||
          new Date(user.createdAt).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000
        );
      case "no_orders":
        return userOrderCount === 0;
      case "min_orders":
        return userOrderCount >= (qualificationValue || 0);
      case "has_subscription":
        return false;
      default:
        return true;
    }
  };

  // Show toast message
  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle banner action click
  const handleBannerAction = (banner: Banner) => {
    if (
      banner.qualification_type &&
      !checkQualification(banner.qualification_type, banner.qualification_value)
    ) {
      showToast("You don't qualify for this offer yet!", "error");
      return;
    }
    if (banner.link) {
      router.push(banner.link);
    }
  };

  // Default banners when no offers
  const defaultBanners: Banner[] = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=400&fit=crop",
      title: "Create Your Professional CV",
      subtitle: "Stand out from the crowd with our AI-powered CV builder",
      link: "/builder",
      qualification_type: "all",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop",
      title: "Get Career Insights",
      subtitle: "Analyze your CV and get personalized recommendations",
      link: "/analyzer",
      qualification_type: "all",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=400&fit=crop",
      title: "Explore Templates",
      subtitle: "Browse our collection of professional CV templates",
      link: "/templates",
      qualification_type: "all",
    },
  ];

  // Use offers if available, otherwise use defaults
  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("user");

    if (!isAuthenticated || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load sample orders (in production, fetch from API)
    const sampleOrders: Order[] = [
      {
        id: "1",
        date: "2024-02-15",
        product: "Professional CV",
        type: "resume",
        amount: 100,
        status: "completed",
        thumbnail:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=566&fit=crop",
        pdfUrl: "/sample-cv.pdf",
      },
      {
        id: "2",
        date: "2024-01-20",
        product: "Cover Letter",
        type: "cover_letter",
        amount: 50,
        status: "pending",
        thumbnail:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=566&fit=crop",
        pdfUrl: "/sample-cover-letter.pdf",
      },
      {
        id: "3",
        date: "2024-01-10",
        product: "Executive CV",
        type: "resume",
        amount: 150,
        status: "completed",
        thumbnail:
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=566&fit=crop",
        pdfUrl: "/sample-executive-cv.pdf",
      },
      {
        id: "4",
        date: "2024-01-05",
        product: "Portfolio Website",
        type: "portfolio",
        amount: 200,
        status: "completed",
        thumbnail:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=566&fit=crop",
        pdfUrl: "/sample-portfolio.pdf",
      },
      {
        id: "5",
        date: "2023-12-20",
        product: "Creative Cover Letter",
        type: "cover_letter",
        amount: 50,
        status: "completed",
        thumbnail:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=566&fit=crop",
        pdfUrl: "/sample-creative-cover.pdf",
      },
    ];
    setOrders(sampleOrders);
    setUserOrderCount(sampleOrders.length);

    // Fetch offers
    fetchOffers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/builder"
            style={{
              padding: "8px 16px",
              background: "var(--green)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + New CV
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content - Documents Display */}
      <main
        style={{
          flex: 1,
          padding: "32px 48px",
          marginTop: "60px",
        }}
      >
        {/* Welcome Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 500,
            }}
          >
            Welcome back, {user.name?.split(" ")[0] || "User"}
          </h1>
        </div>

        {/* Banner Carousel */}
        <BannerCarousel
          banners={displayBanners}
          currentBanner={currentBanner}
          setCurrentBanner={setCurrentBanner}
          onAction={handleBannerAction}
        />

        {/* Search and Filter Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            flexWrap: "nowrap",
            alignItems: "center",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              flex: "1 1 150px",
              minWidth: "120px",
              position: "relative",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "0.85rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            {(
              [
                { key: "all", label: "All" },
                { key: "resume", label: "CV" },
                { key: "cover_letter", label: "Cover" },
                { key: "portfolio", label: "Portfolio" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                style={{
                  padding: "8px 10px",
                  background:
                    filterType === filter.key ? "var(--green)" : "#fff",
                  color: filterType === filter.key ? "#fff" : "var(--muted)",
                  border:
                    filterType === filter.key
                      ? "none"
                      : "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Button */}
          <button
            onClick={() => {
              if (sortBy === "date") {
                if (sortOrder === "desc") {
                  setSortOrder("asc");
                } else {
                  setSortBy("name");
                  setSortOrder("asc");
                }
              } else if (sortBy === "name") {
                if (sortOrder === "asc") {
                  setSortOrder("desc");
                } else {
                  setSortBy("amount");
                  setSortOrder("desc");
                }
              } else {
                setSortBy("date");
                setSortOrder("desc");
              }
            }}
            style={{
              padding: "8px 10px",
              background: "#fff",
              color: "var(--muted)",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
              flexShrink: 0,
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
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            {sortBy === "date" && `${sortOrder === "desc" ? "↓" : "↑"}`}
            {sortBy === "name" && `${sortOrder === "desc" ? "↓" : "↑"}`}
            {sortBy === "amount" && `${sortOrder === "desc" ? "↓" : "↑"}`}
          </button>
        </div>

        {/* Documents Grid - 3 columns on large screens, 2 on mobile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Create New Order Card */}
          <div
            onClick={() => setShowModal(true)}
            style={{
              background: "#fff",
              border: "2px dashed var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p
              style={{
                color: "var(--text)",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Create New
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.75rem",
                marginTop: "4px",
              }}
            >
              CV, Cover Letter or Portfolio
            </p>
          </div>

          {orders
            .filter(
              (order) => filterType === "all" || order.type === filterType,
            )
            .filter(
              (order) =>
                !searchQuery.trim() ||
                order.product
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                order.type.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .sort((a, b) => {
              let comparison = 0;
              if (sortBy === "date") {
                comparison =
                  new Date(a.date).getTime() - new Date(b.date).getTime();
              } else if (sortBy === "name") {
                comparison = a.product.localeCompare(b.product);
              } else if (sortBy === "amount") {
                comparison = a.amount - b.amount;
              }
              return sortOrder === "desc" ? -comparison : comparison;
            })
            .map((order) => (
              <div
                key={order.id}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {/* A4 Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1.414",
                    background: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid var(--border)",
                    position: "relative",
                  }}
                >
                  {order.thumbnail ? (
                    <img
                      src={order.thumbnail}
                      alt={order.product}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--muted)",
                        padding: "20px",
                        textAlign: "center",
                      }}
                    >
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ marginBottom: "8px", opacity: 0.5 }}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                      <span style={{ fontSize: "0.75rem" }}>No Preview</span>
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      background:
                        order.status === "completed" ? "#16a34a" : "#d97706",
                      color: "#fff",
                    }}
                  >
                    {order.status === "completed" ? "Paid" : "Pending"}
                  </span>
                </div>
                {/* Order Info */}
                <div style={{ padding: "16px" }}>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: "4px",
                    }}
                  >
                    {order.product}
                  </h3>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.85rem",
                      marginBottom: "16px",
                    }}
                  >
                    {order.date}
                  </p>
                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => router.push("/builder")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (order.status === "completed") {
                          showToast(
                            "Download started for " + order.product,
                            "success",
                          );
                        }
                      }}
                      disabled={order.status !== "completed"}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background:
                          order.status === "completed"
                            ? "var(--green)"
                            : "#9ca3af",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor:
                          order.status === "completed"
                            ? "pointer"
                            : "not-allowed",
                        opacity: order.status === "completed" ? 1 : 0.6,
                      }}
                    >
                      {order.status === "completed" ? "Download" : "Pending"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Empty State */}
        {orders.filter(
          (order) => filterType === "all" || order.type === filterType,
        ).length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
              No documents found
            </p>
            <Link
              href="/builder"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "var(--green)",
                color: "#fff",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create New Document
            </Link>
          </div>
        ) : null}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 1000,
            padding: "16px 24px",
            borderRadius: "8px",
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
            color: "#fff",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Get Started Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
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
              padding: "40px",
              maxWidth: "480px",
              width: "90%",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                What would you like to create?
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Choose an option to get started
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Link
                href="/templates#resume"
                onClick={() => setShowModal(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: "var(--text)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    Create CV / Resume
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    AI-powered CV builder
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/templates#coverletter"
                onClick={() => setShowModal(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: "var(--text)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    Cover Letter
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    AI-generated for any job
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/templates#portfolio"
                onClick={() => setShowModal(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: "var(--text)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    Portfolio Website
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Hosted link to showcase work
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/analyzer"
                onClick={() => setShowModal(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: "var(--text)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e8f5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    ATS Analyzer
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Score your CV against job descriptions
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerCarousel({
  banners,
  currentBanner,
  setCurrentBanner,
  onAction,
}: {
  banners: Banner[];
  currentBanner: number;
  setCurrentBanner: (index: number) => void;
  onAction?: (banner: Banner) => void;
}) {
  const handleActionClick = (banner: Banner) => {
    if (onAction) {
      onAction(banner);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (banners.length > 0) {
        setCurrentBanner((currentBanner + 1) % banners.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentBanner, banners.length, setCurrentBanner]);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ position: "relative", height: "200px" }}>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: index === currentBanner ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
          >
            <img
              src={banner.image}
              alt={banner.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "32px",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                {banner.title}
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "1rem",
                  marginBottom: "16px",
                }}
              >
                {banner.subtitle}
              </p>
              {banner.link && (
                <button
                  onClick={() => handleActionClick(banner)}
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "var(--green)",
                    color: "#fff",
                    borderRadius: "24px",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    width: "fit-content",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            style={{
              width: index === currentBanner ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              border: "none",
              background:
                index === currentBanner ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
