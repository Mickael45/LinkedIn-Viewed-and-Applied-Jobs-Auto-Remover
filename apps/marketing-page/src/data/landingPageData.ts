import {
  Eye,
  Brain,
  Download,
  Search,
  Clock,
  Check,
  Shield,
  Zap,
  Target,
  Star,
  ChevronDown,
} from "lucide-react";
import { ExoticComponent } from "react";

export const ICONS: { [key: string]: ExoticComponent<{ className?: string }> } =
  {
    Eye,
    Brain,
    Download,
    Search,
    Clock,
    Check,
    Shield,
    Zap,
    Target,
    Star,
    ChevronDown,
  };

export type IconName = keyof typeof ICONS;

export const FEATURES = [
  {
    icon: "Eye" as IconName,
    title: "Smart Job Filtering",
    description:
      "Stop seeing jobs that keep reappearing in your feed. Our extension intelligently marks jobs you've already viewed, applied to, or dismissed with visual indicators, or completely filters them out based on your preference. No more scrolling through the same irrelevant listings over and over again.",
    points: [
      "Visual marking or complete filtering",
      "Remember dismissed applications",
      "Works locally in your browser",
    ],
  },
  {
    icon: "Brain" as IconName,
    title: "AI-Powered Job Summaries",
    description:
      "Stop reading lengthy job descriptions word by word. Our AI instantly analyzes each posting and presents a clean, bullet-point summary of the key information you actually need.",
    points: [
      "Experience requirements",
      "Key skills & technologies",
      "Salary range (when available)",
    ],
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    icon: "Download" as IconName,
    step: 1,
    title: "Install",
    description:
      "Install the extension from the Chrome Web Store in seconds. One click and you're ready to go.",
  },
  {
    icon: "Search" as IconName,
    step: 2,
    title: "Browse",
    description:
      "Go to the LinkedIn jobs page. The extension works automatically in the background - no setup required.",
  },
  {
    icon: "Clock" as IconName,
    step: 3,
    title: "Save Time",
    description:
      "Instantly filter jobs and use AI summaries to focus your search. Find your next opportunity faster than ever.",
  },
];

export const PRICING_TIERS = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    description: "Perfect for getting started",
    features: ["Unlimited Job Filtering", "Works locally in browser"],
    buttonText: "Get Started Free",
    buttonLink:
      "https://chrome.google.com/webstore/detail/your-app-name/your-app-id", // <-- REPLACE WITH YOUR REAL CHROME STORE LINK
    isRecommended: false,
  },
  {
    name: "AI Pro",
    price: "€5.99",
    period: "/month",
    description: "Maximum efficiency with AI power",
    features: [
      "Everything in Free, plus:",
      "AI-Powered Job Summaries",
      "Priority Support",
    ],
    buttonText: "Go AI Pro",
    buttonLink: "https://buy.stripe.com/your_unique_payment_link_id", // <-- REPLACE WITH YOUR REAL STRIPE PAYMENT LINK
    isRecommended: true,
  },
];

export const FAQ_DATA = [
  {
    question: "Does this work with all versions of LinkedIn?",
    answer:
      "It is designed for the standard LinkedIn jobs platform and is actively maintained to keep up with updates. Our team continuously monitors LinkedIn changes to ensure seamless compatibility.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. The extension operates locally in your browser. Job description text is sent anonymously to the AI for analysis and is not stored. We prioritize your privacy and data security above all else.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time with no questions asked. Your extension will continue to work until the end of your current billing period.",
  },
  {
    question: "How accurate are the AI summaries?",
    answer:
      "Our AI system has been trained specifically on job descriptions and achieves over 95% accuracy in extracting key requirements like experience level, skills, and compensation details. It's continuously improving with each analysis.",
  },
];
