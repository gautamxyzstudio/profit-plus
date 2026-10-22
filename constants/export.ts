// Centralized Assets and Brand Design Tokens
// Sabhi images, colors aur routing links yahan se export honge

export const IMAGES = {
  logo: "/logo.png",
  dashboardScreen: "/dashboard-screen.png",
  gridFloor: "/grid-floor.png",
  gridWebp: "/home-hero-grid.webp",
  favicon: "/favicon.ico",
  networkBanner: "/network-banner.jpg",
  howItWorksBanner: "/how-it-works-banner.webp",
  tradingBotBox: "/trading-bot-box.webp",
  botCardBg: "/bot-card-bg.webp",
  candlestickChart: "/candlestick-chart.webp",
  ninjaTraderLogo: "/ninjatrader-logo.webp",
  kinetickLogo: "/kinetick-logo.webp",
  curvedMonitor: "/curved-monitor.webp",
  contactBgArches: "/contact-bg-arches.webp",
  arrow: "/arrow.webp",
  laptop: "/laptop.png",
  candleSoftware: "/candle-softwear.png",
  candleSoftware2: "/candle-softwear2.png",
  aiBot: "/Ai.png",
  notFoundGraphic: "/404-graphic.png",
  perspectiveGrid: "/perspective-grid.webp",
} as const;

export const COLORS = {
  // Brand Green Palette
  primary: "#199250",        // Main vibrant green
  primaryDark: "#055027",    // Deep forest green
  primaryLight: "#22c55e",   // Glow green highlight
  accentMint: "#4ade80",     // Mint text & badges
  bgDeep: "#031d0e",         // Dark emerald background
  bgDarker: "#02140a",       // Deep black-green horizon
  bgWhite: "#ffffff",        // Crisp white section background
  cardBg: "rgba(4, 38, 20, 0.75)",
  cardBorder: "rgba(25, 146, 80, 0.35)",

  // UI Accents
  cyanAccent: "#06b6d4",
  amberAccent: "#f59e0b",
  redCandle: "#ef4444",
  greenCandle: "#22c55e",
  textWhite: "#ffffff",
  textMuted: "rgba(209, 250, 229, 0.85)",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Software", href: "/about-software" },
  { label: "About Company", href: "/about" },
  { label: "Success Story", href: "/success-story" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const HERO_CONTENT = {
  title: "Automate Futures Trading. Maximize Every Opportunity.",
  subtitle:
    "Automate and copy trades across accounts with speed and precision.",
  ctaText: "Book Now",
  ctaLink: "/contact",
} as const;

export const HOW_IT_WORKS_CARDS = [
  {
    id: 1,
    title: "Monitor Market Activity",
    description:
      "ProfitPlus keeps track of market movements and trading activity in real time, helping you stay connected without constant screen time.",
    bgColor: "#084523",
    iconType: "monitor",
  },
  {
    id: 2,
    title: "Execute Trades Automatically",
    description:
      "Once your conditions are met, trades are executed and copied across connected accounts quickly and accurately.",
    bgColor: "#0e7f43",
    iconType: "gears",
  },
  {
    id: 3,
    title: "Review Performance",
    description:
      "Access trade history, execution records, and performance insights to evaluate results and refine your strategy.",
    bgColor: "#084523",
    iconType: "analytics",
  },
  {
    id: 4,
    title: "Trade with Greater Efficiency",
    description:
      "Reduce repetitive tasks, manage multiple accounts with ease, and spend more time focusing on your trading goals.",
    bgColor: "#0e7f43",
    iconType: "team",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  { id: 1, label: "Monitor Market", active: true },
  { id: 2, label: "Execute Trades", active: false },
  { id: 3, label: "Review", active: false },
  { id: 4, label: "Trade with", active: false },
] as const;

export const WHY_CHOOSE_US_CARDS = [
  {
    id: "monitoring",
    title: "Real-Time Market Monitoring",
    description:
      "Stay connected with live market activity and trade updates. ProfitPlus helps you respond quickly by providing timely information and supporting automated trade execution.",
    iconType: "monitoring",
  },
  {
    id: "automation",
    title: "Smart Trade Automation",
    description:
      "Automate trade execution based on your configured settings and strategy. Reduce repetitive manual tasks while maintaining greater consistency across your accounts.",
    iconType: "automation",
  },
  {
    id: "performance",
    title: "Fast & Reliable Performance",
    description:
      "Built for speed and stability, ProfitPlus executes trades efficiently to help minimize delays and keep your trading workflow running smoothly.",
    iconType: "performance",
  },
  {
    id: "support",
    title: "Dedicated Customer Support",
    description:
      "Get the assistance you need when it matters most. Our support team is here to help with setup, platform guidance, and technical questions so you can trade with confidence.",
    iconType: "support",
  },
] as const;

export const FAQ_PAGE_ITEMS = [
  {
    id: 1,
    question: "1. How can I get started with the Profit Plus?",
    answer:
      "Getting started is simple. First, select the plan or automation package that fits your trading goals. Next, connect your preferred trading platform or broker account (such as NinjaTrader®) via our secure API. Once connected, configure your risk parameters, contract sizing, and trading preferences. Our onboarding team provides step-by-step guidance and dedicated setup assistance to ensure you are live and ready to trade with confidence.",
  },
  {
    id: 2,
    question: "2. Is the setup process difficult?",
    answer:
      "Not at all. Profit Plus is engineered for hassle-free installation and setup. We provide detailed video tutorials, comprehensive documentation, and direct 1-on-1 technical onboarding support. Most traders are fully configured and running in under 15 minutes, even with zero prior coding or bot experience.",
  },
  {
    id: 3,
    question: "3. Do I need to manually execute trades?",
    answer:
      "No. The Profit Plus automation bot automatically executes and copies trades in real time based on your defined rules and strategy criteria. You can let the software handle order entries, stop-losses, profit targets, and multi-account copying automatically, or switch to semi-automated mode whenever you wish to retain manual discretion.",
  },
  {
    id: 4,
    question: "4. Do I need extensive knowledge about trading?",
    answer:
      "No extensive trading experience is required. Profit Plus is designed for both novices and seasoned market veterans. Beginners benefit from pre-tested, automated strategies, automated risk controls, and practice simulation environments. Experienced traders can fine-tune indicators, customize trade sizing, and scale across multiple accounts.",
  },
  {
    id: 5,
    question: "5. Is it possible for people to lose money with the automation bot?",
    answer:
      "Yes, trading futures and financial markets always involves inherent market risk, and past performance is never a guarantee of future outcomes. While the Profit Plus bot enforces disciplined execution, automated stop-losses, and removes human emotional errors, losses can still occur during volatile market conditions. We always advise trading responsibly and utilizing strict risk management.",
  },
  {
    id: 6,
    question: "6. Am I able to withdraw my profits at any time?",
    answer:
      "Absolutely. Profit Plus is an automation software layer and does not hold custody of your capital. Your trading funds and profits remain directly in your own regulated brokerage account. You have 100% control over your funds and can deposit or withdraw your money at any time directly through your broker without any restrictions from us.",
  },
  {
    id: 7,
    question: "7. After purchasing the Automation Bot, what are the next steps?",
    answer:
      "Immediately upon completing your purchase, you will receive a welcome email containing your software access credentials, download links, and onboarding materials. You will also get a direct link to schedule your complimentary onboarding session with our technical team to assist with software installation, account connection, and walkthrough.",
  },
  {
    id: 8,
    question: "8. What is your policy regarding refunds?",
    answer:
      "We are committed to delivering the highest level of software quality and client satisfaction. We offer transparent licensing and provide dedicated technical support to help you get the system running successfully. Please review our full Terms of Service and Refund Policy on our website, or contact our support team at Sales@profitplus.us for specific details regarding your license.",
  },
];

export { API_ENDPOINTS } from "./endpoints";


