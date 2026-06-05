export const SECTORS = ["All", "Agritech", "Health", "Education", "Fintech", "Energy", "Industry", "CleanTech", "Consumer"] as const;
export type Sector = typeof SECTORS[number];

export type StartupStory = {
  name: string;
  tagline: string;
  sector: Sector;
  award: string;
  year: number;
};

export const successStories: StartupStory[] = [
  // NSA 2021 Winners
  {
    name: "Reshamandi (Shapos Services)",
    tagline: "AI & IoT-led digital ecosystem for the silk supply chain — from sericulture farmers to consumers.",
    sector: "Agritech",
    award: "NSA 2021 Winner — Agriculture, Farmer Engagement",
    year: 2021,
  },
  {
    name: "Stellapps Technologies",
    tagline: "Full-stack IoT platform digitizing the dairy supply chain to increase farmer income and milk quality.",
    sector: "Agritech",
    award: "NSA 2021 Winner — Animal Husbandry, Productivity",
    year: 2021,
  },
  {
    name: "WEGoT Utility Solutions",
    tagline: "IoT-based real-time water management solution that detects leaks and tracks consumption in buildings.",
    sector: "CleanTech",
    award: "NSA 2021 Winner — Drinking Water",
    year: 2021,
  },
  {
    name: "Thinkerbell Labs",
    tagline: "Annie — the world's first braille literacy device that helps visually impaired people learn to read and write independently.",
    sector: "Education",
    award: "NSA 2021 Winner — Education, Access to Educational Institution",
    year: 2021,
  },
  {
    name: "ZunRoof Tech",
    tagline: "Solar energy and IoT intelligent energy solutions making personal energy consumption cleaner and more affordable.",
    sector: "Energy",
    award: "NSA 2021 Winner — Energy, Clean Energy",
    year: 2021,
  },
  {
    name: "Naffa Innovations (ToneTag)",
    tagline: "World's largest soundwave communication platform enabling payments on any device, including feature phones with no internet.",
    sector: "Fintech",
    award: "NSA 2021 Winner — Fintech, Financial Inclusion",
    year: 2021,
  },
  {
    name: "Health Arx Technologies (BeatO)",
    tagline: "Complete digital ecosystem for diabetes management — glucose monitoring, diet, care coaching, and medicine delivery in one app.",
    sector: "Health",
    award: "NSA 2021 Winner — Health and Wellness, Access to Healthcare",
    year: 2021,
  },
  {
    name: "Tvasta Manufacturing Solutions",
    tagline: "3D-printed construction startup that built India's first 3D-printed house, with precision of ±1mm.",
    sector: "Industry",
    award: "NSA 2021 Winner — Industry 4.0, 3D Printing",
    year: 2021,
  },
  // NSA 2022 Winners
  {
    name: "Medulance Healthcare",
    tagline: "Digitizing the medical transportation segment — GPS-tracked ambulances, trained paramedics, 24/7 dispatch.",
    sector: "Health",
    award: "NSA 2022 Winner — Healthcare and Wellness",
    year: 2022,
  },
  {
    name: "Nextscm Solutions",
    tagline: "AI-powered inventory management for fashion brands and retailers, reducing dead stock and markdowns.",
    sector: "Industry",
    award: "NSA 2022 Winner — Enterprise Technology",
    year: 2022,
  },
  {
    name: "Stylumia Intelligence Technology",
    tagline: "SaaS platform using consumer intelligence and trend forecasting to help fashion brands design the right products.",
    sector: "Consumer",
    award: "NSA 2022 Winner — Enterprise Technology",
    year: 2022,
  },
  // NSA 2023 Winners
  {
    name: "Eeki Automation",
    tagline: "Automation solutions for sustainable agriculture, reducing chemical usage and improving yield through precision farming.",
    sector: "Agritech",
    award: "NSA 2023 Winner — Sustainability Champion",
    year: 2023,
  },
  {
    name: "Vividminds Technologies",
    tagline: "Early-stage edtech startup building immersive learning experiences for K-12 students using AR and gamification.",
    sector: "Education",
    award: "NSA 2023 Rising Star Award",
    year: 2023,
  },
  // NSA 5.0 (2024) Winners
  {
    name: "Gudlyf Mobility",
    tagline: "Urban mobility platform making cities more accessible for people with disabilities through inclusive transport solutions.",
    sector: "Industry",
    award: "NSA 5.0 Winner — Urban Mobility Excellence Award",
    year: 2024,
  },
  {
    name: "Hyphen SCS",
    tagline: "End-to-end supply chain management platform built for the speed and complexity of modern Indian commerce.",
    sector: "Industry",
    award: "NSA 5.0 Winner — Supply Chain Startup of the Year",
    year: 2024,
  },
  {
    name: "Peppertree.ai",
    tagline: "AI-driven platform automating complex business workflows — from document processing to intelligent decision support.",
    sector: "Industry",
    award: "NSA 5.0 Finalist — Best Deeptech Startup",
    year: 2024,
  },
  {
    name: "Tapits Technologies",
    tagline: "Mobile-first payment infrastructure startup enabling seamless digital payments for underbanked merchants and consumers.",
    sector: "Fintech",
    award: "NSA 5.0 Winner — Fintech Revolution Catalyst Award",
    year: 2024,
  },
  {
    name: "Caelum Global Tech",
    tagline: "Deeptech startup building next-generation satellite communication solutions for connectivity in remote regions of India.",
    sector: "Industry",
    award: "NSA 5.0 Finalist — Infrastructure Excellence Award",
    year: 2024,
  },
  {
    name: "Kumaonkhand Agro Innovations",
    tagline: "Agri-hospitality startup from Uttarakhand combining organic farming, rural tourism, and direct farmer-to-consumer supply chains.",
    sector: "Agritech",
    award: "NSA 5.0 Finalist — Trailblazers from North-East and Hilly Regions",
    year: 2024,
  },
  {
    name: "Sarvajna Edutech",
    tagline: "Vernacular learning platform making quality education accessible in regional Indian languages for rural and semi-urban students.",
    sector: "Education",
    award: "NSA 5.0 Finalist",
    year: 2024,
  },
  {
    name: "Mobisec Technologies",
    tagline: "Cybersecurity startup providing mobile-first threat detection and security operations for Indian enterprises.",
    sector: "Industry",
    award: "NSA 5.0 Finalist",
    year: 2024,
  },
  {
    name: "Revasa Farms",
    tagline: "Tech-enabled urban farming platform delivering fresh, pesticide-free produce through hyperlocal vertical farms.",
    sector: "Agritech",
    award: "NSA 5.0 Finalist",
    year: 2024,
  },
  {
    name: "Uma Robotics Technology",
    tagline: "Industrial robotics startup building affordable automation solutions for India's small and medium manufacturers.",
    sector: "Industry",
    award: "NSA 5.0 Finalist — Make in India Excellence Award",
    year: 2024,
  },
  {
    name: "MobilePe E-Commerce",
    tagline: "Social commerce platform enabling small businesses and individual sellers to build storefronts and sell via WhatsApp.",
    sector: "Consumer",
    award: "NSA 5.0 Finalist",
    year: 2024,
  },
];
