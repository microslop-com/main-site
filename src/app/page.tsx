"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Search,
  LayoutGrid,
  Brain,
  FileText,
  ShieldAlert,
  RefreshCcw,
  ChevronRight,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Menu,
  X,
  ExternalLink,
  Flame,
  BarChart3,
  MessageSquareWarning,
  Home as HomeIcon,
  Download,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  email?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ADMIN COMPLAINTS MANAGEMENT
// ============================================================================
const ADMIN_STORAGE_KEY = "microslop_admin_complaints";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Hardcoded example complaints visible to all visitors
const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: "default-1",
    title: "Bing AI Summary Fabricated a Product Recall",
    description:
      "Searched for a product recall notice on Bing. The AI summary confidently stated the product was recalled in March 2025 with a link to a press release. The link was dead, the product was never recalled, and the supposed press release never existed. The fabricated summary appeared above all real search results.",
    category: "search",
    severity: "critical",
    email: null,
    status: "open",
    createdAt: "2026-03-15T10:30:00.000Z",
    updatedAt: "2026-03-15T10:30:00.000Z",
  },
  {
    id: "default-2",
    title: "Copilot Suggested Deleting Critical System Files",
    description:
      "Asked Copilot in Windows 11 how to free up disk space. It suggested running a command that would delete the entire WindowsApps folder, which would break all installed Microsoft Store apps including Windows Security. The suggestion was presented as a safe, recommended cleanup step with no warning.",
    category: "hallucination",
    severity: "critical",
    email: null,
    status: "reviewing",
    createdAt: "2026-03-12T14:20:00.000Z",
    updatedAt: "2026-03-18T09:15:00.000Z",
  },
  {
    id: "default-3",
    title: "Word Copilot Button Cannot Be Permanently Disabled",
    description:
      "Every time Microsoft Word updates, the Copilot button reappears in the ribbon despite being disabled in settings. It takes up toolbar space, causes slight UI lag when hovering, and there is no group policy or registry key to permanently suppress it across updates.",
    category: "ui",
    severity: "medium",
    email: null,
    status: "open",
    createdAt: "2026-03-08T08:45:00.000Z",
    updatedAt: "2026-03-08T08:45:00.000Z",
  },
  {
    id: "default-4",
    title: "AI-Generated Tech Blog Ranked Above Official Docs",
    description:
      "Googled a specific Azure API error code. The top 3 results were AI-generated blogs on Medium and substack that contained fabricated code examples. The official Microsoft documentation appeared on page 2. The AI blogs confidently explained the error with completely wrong solutions.",
    category: "content",
    severity: "high",
    email: null,
    status: "resolved",
    createdAt: "2026-02-28T16:00:00.000Z",
    updatedAt: "2026-03-10T11:30:00.000Z",
  },
];

function loadAdminComplaints(): Complaint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminComplaints(complaints: Complaint[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(complaints));
  } catch {
    // storage full or unavailable — silent fail
  }
}

function mergeComplaints(): Complaint[] {
  const admin = loadAdminComplaints();
  const all = [...admin, ...DEFAULT_COMPLAINTS];
  // Deduplicate by id (admin complaints take priority)
  const seen = new Set<string>();
  return all.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

// ============================================================================
// SCROLL TO TOP HOOK
// ============================================================================
function useScrollTop(threshold = 400) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return show;
}

// ============================================================================
// SLOP COUNTER HOOK
// ============================================================================
function useSlopCounter() {
  const [count, setCount] = useState(8_472_000);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 400) + 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return count.toLocaleString("en-US");
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ============================================================================
// SCROLL TO TOP BUTTON
// ============================================================================
function ScrollToTop() {
  const show = useScrollTop();
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-4 bottom-20 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-destructive text-white shadow-lg md:bottom-6 lg:hidden"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MOBILE BOTTOM NAV
// ============================================================================
function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const sections = ["top", "manifest", "tracker", "complaints", "report"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const tabs = [
    { id: "top", label: "Home", icon: HomeIcon },
    { id: "manifest", label: "Manifest", icon: AlertTriangle },
    { id: "complaints", label: "Board", icon: MessageSquareWarning },
    { id: "report", label: "Report", icon: Send },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/40 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className={cn(
                "flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors",
                isActive
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "font-bold")} />
              <span className="text-[10px] font-semibold leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "#top", label: "Home" },
    { href: "#manifest", label: "Manifest" },
    { href: "#tracker", label: "Tracker" },
    { href: "#complaints", label: "Complaints" },
    { href: "#report", label: "Report" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <button
          onClick={() => scrollTo("#top")}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive sm:h-9 sm:w-9">
            <AlertTriangle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <span className="text-base font-black tracking-widest sm:text-lg">
            MICROSLOP
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
          <a
            href="https://status.microslop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Status
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/40 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-3 pb-4">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="flex h-12 items-center rounded-lg px-4 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="https://status.microslop.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-emerald-500 transition-colors hover:bg-accent"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Infrastructure Status
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection() {
  const counter = useSlopCounter();

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-bg.png"
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-16 sm:px-6 sm:pt-24 sm:pb-36 lg:px-8 lg:pt-32 lg:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge
            variant="outline"
            className="mb-4 border-destructive/50 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm"
          >
            <Flame className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
            Live Tracking Active
          </Badge>

          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Microsoft Is Drowning
            <br />
            <span className="text-destructive">The Internet in AI Slop</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl">
            A manifesto documenting the systematic flooding of low-quality,
            synthesized, and unverified content across the web.
          </p>

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-6 max-w-xs rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm sm:mt-10 sm:max-w-sm sm:p-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-xs">
              Gallons of Slop Generated
            </p>
            <p className="mt-1 font-mono text-3xl font-black tabular-nums text-destructive sm:mt-2 sm:text-4xl lg:text-5xl">
              {counter}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:mt-1 sm:text-xs">
              per second
            </p>
          </motion.div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <a
              href="https://status.microslop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-card px-5 text-sm font-semibold text-card-foreground shadow-sm ring-1 ring-border/50 transition-all hover:bg-accent hover:shadow-md sm:h-auto sm:w-auto sm:py-2.5"
            >
              View Infrastructure Status
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() =>
                document
                  .getElementById("manifest")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-destructive/90 hover:shadow-md sm:h-auto sm:w-auto sm:py-2.5"
            >
              Explore the Manifest
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MANIFEST SECTION
// ============================================================================
const manifestCategories = [
  {
    icon: Search,
    title: "Search Slop",
    tag: "Bing Corruption",
    description:
      "Bing's integration of AI-generated summaries floods search results with hallucinated facts, fabricated citations, and confidently incorrect information. Users receive synthesized garbage instead of verified sources.",
    items: [
      "Hallucinated product reviews",
      "Fabricated statistics",
      "Non-existent citations",
    ],
  },
  {
    icon: LayoutGrid,
    title: "UI Bloat",
    tag: "Copilot Invasion",
    description:
      "Copilot buttons, AI suggestions, and 'intelligent' overlays are forced into every Microsoft product. Bloated interfaces distract from core functionality while pushing users toward AI-generated content.",
    items: [
      "Unwanted Copilot prompts",
      "Cluttered UI paradigms",
      "Forced AI integration",
    ],
  },
  {
    icon: Brain,
    title: "Hallucinations",
    tag: "Confidence Errors",
    description:
      "Copilot confidently generates false information, fake code snippets, and non-existent references. Users trust the output, propagating misinformation across the web at scale.",
    items: [
      "Fabricated code examples",
      "Invented facts presented as truth",
      "Broken documentation links",
    ],
  },
  {
    icon: FileText,
    title: "Content Pollution",
    tag: "Mass Generation",
    description:
      "AI-generated blog posts, articles, and social content flood the web. Low-effort, high-volume content drowns out human creativity and authentic voices.",
    items: [
      "Spam articles indexed by search",
      "Synthetic social media posts",
      "Derivative content at scale",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Verification Crisis",
    tag: "Trust Collapse",
    description:
      "As AI slop proliferates, users lose trust in all content. The signal-to-noise ratio collapses. Verification becomes impossible at scale when synthetic content is indistinguishable from real.",
    items: [
      "Inability to verify sources",
      "Synthetic media indistinguishable from real",
      "Erosion of information trust",
    ],
  },
  {
    icon: RefreshCcw,
    title: "The Slop Cycle",
    tag: "Recursive Decay",
    description:
      "AI trains on web data, generates slop, slop gets indexed, AI trains on slop, producing worse models. The internet becomes a hall of mirrors where quality degrades with each iteration.",
    items: [
      "Model collapse from synthetic training data",
      "Quality degradation each iteration",
      "Irreversible internet pollution",
    ],
  },
];

function ManifestSection() {
  return (
    <section id="manifest" className="border-t border-border/40 bg-muted/30 py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <Badge
              variant="secondary"
              className="mb-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest sm:mb-4 sm:text-xs"
            >
              The Problem
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            custom={1}
            className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl"
          >
            The Slop Manifest
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base"
          >
            Six dimensions of AI content degradation that are systematically
            eroding the quality and trustworthiness of the internet.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={staggerContainer}
          className="mt-8 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {manifestCategories.map((cat, i) => (
            <motion.div key={cat.title} variants={fadeInUp} custom={i}>
              <Card className="group h-full border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/5">
                <CardHeader className="space-y-3 pb-3 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-white">
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                      {cat.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold sm:text-lg">
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                    {cat.description}
                  </p>
                  <Separator className="my-3 bg-border/50 sm:my-4" />
                  <ul className="space-y-1.5 sm:space-y-2">
                    {cat.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-muted-foreground sm:text-sm"
                      >
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-destructive/70 sm:h-3.5 sm:w-3.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// TRACKER SECTION
// ============================================================================
const trackerItems = [
  {
    date: "2026-01-21",
    severity: "critical",
    title: "Bing Search Results Flooded with AI Hallucinations",
    description:
      "Users report fabricated product reviews and non-existent citations appearing in Bing search results, with no indication that the content is AI-generated.",
  },
  {
    date: "2026-01-20",
    severity: "critical",
    title: "Copilot Generates Broken Code Snippets",
    description:
      "Developers report Copilot-generated code containing syntax errors, deprecated API calls, and security vulnerabilities in production environments.",
  },
  {
    date: "2026-01-19",
    severity: "high",
    title: "Windows 11 UI Cluttered with Unwanted AI Suggestions",
    description:
      "Users forced to see Copilot prompts and AI suggestions across Windows 11 interface with no option to permanently disable them.",
  },
  {
    date: "2026-01-18",
    severity: "high",
    title: "AI-Generated Blog Posts Indexed as Authoritative",
    description:
      "Search engines rank AI-generated content above human-written articles, pushing low-effort synthetic content to top positions.",
  },
];

function TrackerSection() {
  return (
    <section id="tracker" className="border-t border-border/40 py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <Badge
              variant="secondary"
              className="mb-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest sm:mb-4 sm:text-xs"
            >
              Live Feed
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            custom={1}
            className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl"
          >
            Slop Tracker
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base"
          >
            Documented incidents of AI-generated content flooding the internet
            or corrupting user experience.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={staggerContainer}
          className="mt-8 space-y-3 sm:mt-16 sm:space-y-4"
        >
          {trackerItems.map((item, i) => (
            <motion.div key={i} variants={fadeInUp} custom={i}>
              <Card className="border-border/50 bg-card/60 transition-all duration-300 hover:border-border hover:bg-card/80">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5 lg:p-6">
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground sm:text-xs">
                      {item.date}
                    </span>
                    <Badge
                      variant={
                        item.severity === "critical" ? "destructive" : "secondary"
                      }
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider sm:text-[10px]",
                        item.severity !== "critical" &&
                          "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      )}
                    >
                      {item.severity === "critical" ? "Critical" : "High"}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPLAINTS SECTION
// ============================================================================
function ComplaintsSection() {
  const { toast } = useToast();
  // Use hardcoded defaults for SSR, then merge admin complaints on client
  const [complaints, setComplaints] = useState<Complaint[]>(DEFAULT_COMPLAINTS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formSeverity, setFormSeverity] = useState("medium");
  const [formEmail, setFormEmail] = useState("");

  // On mount (client only), merge admin complaints from localStorage
  useEffect(() => {
    setComplaints(mergeComplaints());
  }, []);

  // Secret admin toggle: Ctrl+Shift+A
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsAdmin((prev) => {
          const next = !prev;
          if (next) {
            toast({
              title: "Admin mode activated",
              description: "You can now add, edit, and delete complaints.",
            });
          } else {
            setShowForm(false);
            toast({ title: "Admin mode deactivated" });
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast]);

  const refreshComplaints = useCallback(() => {
    setComplaints(mergeComplaints());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    setSubmitting(true);

    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id: generateId(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      severity: formSeverity,
      email: formEmail.trim() || null,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };

    const admin = loadAdminComplaints();
    const updatedAdmin = [newComplaint, ...admin];
    saveAdminComplaints(updatedAdmin);
    setComplaints(mergeComplaints());

    toast({
      title: "Complaint added",
      description: "Your complaint has been recorded.",
    });

    setFormTitle("");
    setFormDescription("");
    setFormCategory("general");
    setFormSeverity("medium");
    setFormEmail("");
    setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    // Only admin-added complaints can be deleted from localStorage
    const admin = loadAdminComplaints();
    const filtered = admin.filter((c) => c.id !== id);
    saveAdminComplaints(filtered);
    setComplaints(mergeComplaints());
    toast({ title: "Complaint deleted" });
  };

  const handleStatusChange = (id: string, status: string) => {
    // Check if it's an admin complaint
    const admin = loadAdminComplaints();
    const isAdminComplaint = admin.some((c) => c.id === id);

    if (isAdminComplaint) {
      const updatedAdmin = admin.map((c) =>
        c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
      );
      saveAdminComplaints(updatedAdmin);
    }
    // For default complaints, status change is session-only (not persisted)
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const severityColors: Record<string, string> = {
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    high: "border-orange-500/30 bg-orange-500/10 text-orange-500",
    critical: "border-red-500/30 bg-red-500/10 text-red-500",
  };

  const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    open: { icon: Clock, label: "Open", color: "text-amber-500" },
    reviewing: { icon: BarChart3, label: "Reviewing", color: "text-blue-400" },
    resolved: { icon: CheckCircle2, label: "Resolved", color: "text-emerald-500" },
    dismissed: { icon: XCircle, label: "Dismissed", color: "text-zinc-400" },
  };

  return (
    <section
      id="complaints"
      className="border-t border-border/40 bg-muted/30 py-12 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <div className="text-center">
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                variant="secondary"
                className="mb-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest sm:mb-4 sm:text-xs"
              >
                Logged Incidents
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            >
              Complaints Board
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base"
            >
              A curated log of documented AI slop complaints and incidents.
              Each entry is verified and categorized by severity.
            </motion.p>
          </div>

          {/* Admin-only: Add button */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center gap-2 sm:mt-8"
            >
              <Badge variant="outline" className="border-destructive/50 bg-destructive/5 text-destructive">
                <ShieldAlert className="mr-1 h-3 w-3" />
                Admin Mode Active
              </Badge>
              <Button
                onClick={() => {
                  setShowForm(!showForm);
                  setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="h-12 gap-2 px-6 sm:h-auto sm:px-4"
              >
                {showForm ? (
                  <>
                    <X className="h-4 w-4" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Complaint
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Complaint Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="mx-auto mt-6 max-w-2xl border-destructive/20 sm:mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageSquareWarning className="h-5 w-5 text-destructive" />
                      New Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="c-title" className="text-sm">Title *</Label>
                          <Input
                            id="c-title"
                            placeholder="Brief title for the complaint"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="c-email" className="text-sm">Email (optional)</Label>
                          <Input
                            id="c-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Category</Label>
                          <Select
                            value={formCategory}
                            onValueChange={setFormCategory}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="search">Search Slop</SelectItem>
                              <SelectItem value="ui">UI Bloat</SelectItem>
                              <SelectItem value="hallucination">Hallucination</SelectItem>
                              <SelectItem value="content">Content Pollution</SelectItem>
                              <SelectItem value="privacy">Privacy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Severity</Label>
                          <Select
                            value={formSeverity}
                            onValueChange={setFormSeverity}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="c-desc" className="text-sm">Description *</Label>
                        <Textarea
                          id="c-desc"
                          placeholder="Describe the complaint in detail..."
                          rows={4}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !formTitle.trim() || !formDescription.trim()}
                        className="h-12 w-full gap-2 text-sm sm:h-auto sm:w-auto"
                      >
                        {submitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4" /> Submit Complaint
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complaints List */}
          <div className="mt-8 sm:mt-12">
            {complaints.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
                  <MessageSquareWarning className="mb-3 h-8 w-8 text-muted-foreground/50 sm:h-10 sm:w-10" />
                  <p className="text-sm font-semibold text-muted-foreground sm:text-base">
                    No complaints yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70 sm:text-sm">
                    No complaints have been logged yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {complaints.map((complaint, i) => {
                  const StatusIcon = statusConfig[complaint.status]?.icon || Clock;
                  const statusLabel = statusConfig[complaint.status]?.label || complaint.status;
                  const statusColor = statusConfig[complaint.status]?.color || "text-zinc-400";

                  return (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-border/50 bg-card/60 transition-all duration-200 hover:bg-card/80">
                        <CardContent className="p-3.5 sm:p-5">
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h3 className="text-sm font-bold leading-snug sm:text-base">
                                  {complaint.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[8px] font-bold uppercase tracking-wider sm:text-[10px]",
                                    severityColors[complaint.severity]
                                  )}
                                >
                                  {complaint.severity}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[8px] uppercase tracking-wider text-muted-foreground sm:text-[10px]"
                                >
                                  {complaint.category}
                                </Badge>
                              </div>
                              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
                                {complaint.description}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:mt-2 sm:gap-3 sm:text-xs">
                                <span className="flex items-center gap-1">
                                  <StatusIcon className={cn("h-3 w-3", statusColor)} />
                                  <span className={cn("font-medium capitalize", statusColor)}>
                                    {statusLabel}
                                  </span>
                                </span>
                                <span>
                                  {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                {complaint.email && (
                                  <span className="truncate text-[10px] sm:text-xs">
                                    {complaint.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-2 border-t border-border/30 pt-2.5 sm:flex-col sm:items-end sm:gap-2 sm:border-t-0 sm:pt-0">
                                <Select
                                  value={complaint.status}
                                  onValueChange={(val) =>
                                    handleStatusChange(complaint.id, val)
                                  }
                                >
                                  <SelectTrigger className="h-9 w-[110px] text-xs sm:h-8 sm:w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="reviewing">Reviewing</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="dismissed">Dismissed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive sm:h-8 sm:w-8"
                                  onClick={() => handleDelete(complaint.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// REPORT SECTION
// ============================================================================
function ReportSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/xwvvzyjr", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {
      setSubmitted(true);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="report" className="border-t border-border/40 py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <Badge
              variant="secondary"
              className="mb-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest sm:mb-4 sm:text-xs"
            >
              Take Action
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            custom={1}
            className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl"
          >
            Report Slop
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base"
          >
            Witnessed AI slop in the wild? Document it. Submit verified reports
            of Microsoft&apos;s AI-generated content flooding the internet.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl sm:mt-12"
        >
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-6 text-center sm:py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 sm:h-14 sm:w-14">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="mt-3 text-base font-bold sm:mt-4 sm:text-lg">
                    Report Submitted
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">
                    Thank you for documenting this incident. Your report helps
                    track AI slop across the internet.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 sm:mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Report
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slop-type" className="text-sm">Slop Type</Label>
                    <Select name="slop_type" defaultValue="">
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="search">Search Slop</SelectItem>
                        <SelectItem value="ui">UI Bloat</SelectItem>
                        <SelectItem value="hallucination">Hallucination</SelectItem>
                        <SelectItem value="content">Content Pollution</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="r-title" className="text-sm">Title</Label>
                    <Input
                      id="r-title"
                      name="title"
                      placeholder="Brief description of the slop"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="r-desc" className="text-sm">Description</Label>
                    <Textarea
                      id="r-desc"
                      name="description"
                      placeholder="Detailed account of the AI slop incident..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="r-url" className="text-sm">URL / Reference</Label>
                      <Input
                        id="r-url"
                        name="url"
                        type="url"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-email" className="text-sm">Email</Label>
                      <Input
                        id="r-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full gap-2 text-sm sm:h-auto sm:w-auto"
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Report
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// INSTALL PWA BANNER
// ============================================================================
function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show on mobile after a delay
      if (window.innerWidth < 768) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => void }).prompt();
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed inset-x-0 bottom-16 z-50 px-4 sm:bottom-4"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-xl backdrop-blur-xl">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
          <Download className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Install MICROSLOP</p>
          <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => setShowBanner(false)}>
            Later
          </Button>
          <Button size="sm" className="h-9 text-xs" onClick={handleInstall}>
            Install
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 pb-20 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-black tracking-widest sm:text-sm">
              MICROSLOP
            </span>
          </div>
          <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
            A manifesto against AI-generated content flooding the internet.
            Not affiliated with Microsoft. All trademarks belong to their
            respective owners.
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <a
              href="https://status.microslop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Service Status
            </a>
            <Separator orientation="vertical" className="h-3 sm:h-4" />
            <a
              href="mailto:info@microslop.com"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground/60 sm:text-xs">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ManifestSection />
        <TrackerSection />
        <ComplaintsSection />
        <ReportSection />
      </main>
      <Footer />
      <MobileBottomNav />
      <ScrollToTop />
      <PWAInstallBanner />
    </div>
  );
}
