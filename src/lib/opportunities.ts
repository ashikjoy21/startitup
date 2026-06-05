export type Opportunity = {
  id: string;
  name: string;
  org: string;
  short: string;
  description: string;
  category: string;
  industry: string;
  stage: string;
  location: string;
  amount: string;
  deadline: string;
  eligibility: string;
  logo: string;
  sourceUrl?: string | null;
};

export const defaultCategories = [
  "Startup Credits",
  "Grants",
  "Accelerators",
  "Incubators",
  "Government Schemes",
  "Fellowships",
  "Competitions",
  "Investor Programs",
] as const;

export type OpportunityCategory = typeof defaultCategories[number];

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export const seedOpportunities: Opportunity[] = [
  {
    id: "aws-activate",
    name: "AWS Activate Credits",
    org: "Amazon Web Services",
    short: "Up to $100,000 in AWS credits for eligible startups.",
    description:
      "AWS Activate provides startups with the resources needed to get started on AWS — including AWS credits, technical support, and training.",
    category: "Startup Credits",
    industry: "SaaS",
    stage: "Seed",
    location: "Global",
    amount: "Up to ₹83,00,000",
    deadline: "Rolling",
    eligibility: "Privately held, <10 yrs old, <$100M funding.",
    logo: "A",
    sourceUrl: "https://aws.amazon.com/activate/",
  },
  {
    id: "microsoft-for-startups",
    name: "Microsoft for Startups",
    org: "Microsoft",
    short: "Azure credits, GitHub Enterprise, and go-to-market support.",
    description:
      "The Microsoft for Startups Founders Hub offers up to $150K in Azure credits along with access to Microsoft technologies, mentorship, and customer connections.",
    category: "Startup Credits",
    industry: "SaaS",
    stage: "Pre-Seed",
    location: "Global",
    amount: "Up to ₹1,24,50,000",
    deadline: "Rolling",
    eligibility: "B2B/B2C startups building software.",
    logo: "M",
    sourceUrl: "https://www.microsoft.com/en-us/startups",
  },
  {
    id: "startup-india-seed-fund",
    name: "Startup India Seed Fund Scheme",
    org: "Government of India",
    short: "Seed funding to startups for proof of concept and prototype.",
    description:
      "SISFS provides financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization.",
    category: "Government Schemes",
    industry: "All",
    stage: "Pre-Seed",
    location: "India",
    amount: "Up to ₹50,00,000",
    deadline: "Mar 31, 2026",
    eligibility: "DPIIT-recognized startup, <2 yrs old.",
    logo: "G",
    sourceUrl: "https://seedfund.startupindia.gov.in/",
  },
  {
    id: "nasscom-10k",
    name: "NASSCOM 10K Startups",
    org: "NASSCOM",
    short: "Incubation, mentorship and market access for tech startups.",
    description:
      "NASSCOM 10K Startups is an industry-led initiative aiming to scale up 10,000 startups in India over the next decade.",
    category: "Incubators",
    industry: "Deep Tech",
    stage: "Seed",
    location: "India",
    amount: "Up to ₹25,00,000",
    deadline: "Jan 20, 2026",
    eligibility: "Indian tech startups <5 yrs old.",
    logo: "N",
    sourceUrl: "https://10000startups.com/",
  },
  {
    id: "birac-big",
    name: "BIRAC BIG Grant",
    org: "BIRAC",
    short: "Biotechnology Ignition Grant for early-stage biotech startups.",
    description:
      "BIG supports innovative ideas with commercial potential in the biotech space with grant-in-aid of up to ₹50 lakhs.",
    category: "Grants",
    industry: "Biotech",
    stage: "Pre-Seed",
    location: "India",
    amount: "Up to ₹50,00,000",
    deadline: "Feb 14, 2026",
    eligibility: "Indian biotech innovators, individuals or startups.",
    logo: "B",
    sourceUrl: "https://birac.nic.in/desc_new.php?id=364",
  },
  {
    id: "yc-india-track",
    name: "Y Combinator (India)",
    org: "Y Combinator",
    short: "3-month accelerator program with $500K investment.",
    description:
      "YC funds startups twice a year. Companies receive $500,000 in investment, plus access to mentors and an alumni network.",
    category: "Accelerators",
    industry: "All",
    stage: "Pre-Seed",
    location: "Remote / SF",
    amount: "₹4,15,00,000",
    deadline: "Apr 12, 2026",
    eligibility: "Any startup with a working team.",
    logo: "Y",
    sourceUrl: "https://www.ycombinator.com/apply",
  },
  {
    id: "google-for-startups",
    name: "Google for Startups Cloud Program",
    org: "Google",
    short: "Up to $200,000 in Google Cloud credits over two years.",
    description:
      "Cloud credits, technical training, and Google-wide support for AI-first and Series A startups.",
    category: "Startup Credits",
    industry: "AI",
    stage: "Seed",
    location: "Global",
    amount: "Up to ₹1,66,00,000",
    deadline: "Rolling",
    eligibility: "Funded startups <5 yrs old.",
    logo: "G",
    sourceUrl: "https://cloud.google.com/startup",
  },
  {
    id: "tdb-grant",
    name: "Technology Development Board Grant",
    org: "TDB, Govt. of India",
    short: "Financial assistance to commercialize indigenous technology.",
    description:
      "TDB provides equity capital or loans to industrial concerns and other agencies for the development and commercialization of indigenous technology.",
    category: "Grants",
    industry: "Deep Tech",
    stage: "Series A",
    location: "India",
    amount: "Up to ₹5,00,00,000",
    deadline: "Mar 30, 2026",
    eligibility: "Indian companies commercializing tech.",
    logo: "T",
    sourceUrl: "https://tdb.gov.in/",
  },
  {
    id: "tie-grand-challenge",
    name: "TiE Global Grand Challenge",
    org: "TiE",
    short: "Global startup competition with cash prizes and investor access.",
    description:
      "Annual competition recognizing high-impact startups across sectors with cash prizes, mentorship, and global investor exposure.",
    category: "Competitions",
    industry: "All",
    stage: "Seed",
    location: "Global",
    amount: "Up to ₹40,00,000",
    deadline: "Feb 28, 2026",
    eligibility: "Startups <7 yrs, revenue <$5M.",
    logo: "T",
    sourceUrl: "https://tie.org/",
  },
  {
    id: "atal-incubation",
    name: "Atal Incubation Centre",
    org: "NITI Aayog",
    short: "Government-backed incubation across India.",
    description:
      "AICs nurture innovative startups in their pursuit to become scalable and sustainable business enterprises.",
    category: "Incubators",
    industry: "All",
    stage: "Pre-Seed",
    location: "India",
    amount: "Up to ₹10,00,00,000",
    deadline: "Rolling",
    eligibility: "Indian startups across sectors.",
    logo: "A",
    sourceUrl: "https://aim.gov.in/atal-incubation-centres.php",
  },
  {
    id: "chevening",
    name: "Chevening Fellowship",
    org: "UK Government",
    short: "Fully-funded fellowship for emerging leaders.",
    description:
      "Chevening offers fully funded fellowships in the UK for outstanding individuals with leadership potential.",
    category: "Fellowships",
    industry: "All",
    stage: "Any",
    location: "United Kingdom",
    amount: "Fully Funded",
    deadline: "Nov 5, 2026",
    eligibility: "Founders with 2+ yrs work experience.",
    logo: "C",
    sourceUrl: "https://www.chevening.org/fellowships/",
  },
  {
    id: "sequoia-surge",
    name: "Peak XV Surge",
    org: "Peak XV Partners",
    short: "Rapid scale-up program with $3M investment.",
    description:
      "Surge is a 16-week rapid scale-up program for early-stage startups across Asia.",
    category: "Investor Programs",
    industry: "All",
    stage: "Seed",
    location: "India / SEA",
    amount: "₹24,90,00,000",
    deadline: "Jan 31, 2026",
    eligibility: "Early-stage startups in Asia.",
    logo: "P",
    sourceUrl: "https://www.surgeahead.com/",
  },
];
