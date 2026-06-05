import type { OpportunityCategory } from "./opportunities";

export type GuideSection = {
  id: string;
  heading: string;
  body?: string;
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  source: string;
  relatedCategories: OpportunityCategory[];
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "dpiit-recognition",
    title: "How to Get DPIIT Startup Recognition",
    description:
      "A step-by-step walkthrough of the DPIIT recognition process — eligibility, documents, and what happens after you're recognized.",
    readTime: "7 min read",
    source: "Startup India / DPIIT",
    relatedCategories: ["Government Schemes", "Grants"],
    sections: [
      {
        id: "what-is-dpiit",
        heading: "What is DPIIT Recognition?",
        body: "DPIIT (Department for Promotion of Industry and Internal Trade) recognition is the official government certification that identifies your company as a startup under the Startup India initiative. It is the gateway to virtually every government benefit available to Indian startups — tax exemptions, easier public procurement, faster IP filing, and access to schemes like the Startup India Seed Fund.\n\nRecognition is not just a certificate. It assigns your startup a unique DIPP number that government agencies, banks, and investors use to verify your eligibility for programs. Without it, you cannot apply for 80-IAC income tax exemption, Angel Tax exemption under Section 56, or the Credit Guarantee Fund Scheme for Startups.",
      },
      {
        id: "eligibility",
        heading: "Who is Eligible?",
        body: "Your entity must be incorporated as a Private Limited Company, Registered Partnership Firm, or Limited Liability Partnership in India. It must be less than 10 years old from the date of incorporation (extended from the original 7 years; 10 years for biotech startups). Annual turnover must not exceed ₹100 crore in any financial year since incorporation.\n\nCritically, the startup must be working towards innovation, development, or improvement of products, processes, or services — or it must have a scalable business model with high potential for employment or wealth creation. Companies formed through splitting or restructuring of existing businesses are not eligible.",
        bullets: [
          "Incorporated as Pvt Ltd, LLP, or Registered Partnership",
          "Less than 10 years old from date of incorporation",
          "Annual turnover under ₹100 crore in all financial years",
          "Working on innovation, or scalable business model",
          "Not formed by splitting/restructuring an existing business",
        ],
      },
      {
        id: "how-to-apply",
        heading: "How to Apply",
        body: "Applications are made entirely online through the Startup India portal (startupindia.gov.in). The process takes 2–3 working days in most cases and there is no fee.\n\n1. Register on startupindia.gov.in with your company email.\n2. Go to 'Get DPIIT Recognition' and fill in your company details: incorporation date, CIN/LLPIN, registered address, sector, and description of your innovation.\n3. Upload the required documents (see below).\n4. Submit. You will receive an acknowledgement number immediately.\n5. DPIIT reviews the application and issues the recognition certificate (or seeks clarification) within 2 working days.",
      },
      {
        id: "documents",
        heading: "Documents Required",
        bullets: [
          "Certificate of Incorporation / Registration Certificate",
          "PAN card of the entity",
          "Brief description of the business / innovation (max 500 words)",
          "Proof of funding received (if any) — term sheets, bank statements",
          "Awards or recognition received (optional but strengthens application)",
          "Patent details (optional)",
        ],
        body: "All documents must be self-attested and uploaded as PDFs. There is no requirement to submit a detailed business plan, but a clear description of your innovation or scalable model is critical — vague descriptions are the most common reason for rejection.",
      },
      {
        id: "after-recognition",
        heading: "What Happens After Recognition?",
        body: "Once recognized, you receive a DPIIT recognition certificate with a unique number. This number unlocks: income tax exemption under Section 80-IAC (requires a separate application to the Inter-Ministerial Board); Angel Tax exemption under Section 56(2)(viib); IPR fast-track examination; easier public procurement (exemption from prior experience and turnover criteria for government tenders); and self-certification under 9 environmental and labour laws.\n\nYou also get access to the Startup India Hub — a knowledge platform, mentorship network, and funding connect portal. Recognition is valid as long as your startup continues to meet the eligibility criteria.",
      },
    ],
  },
  {
    slug: "tax-benefits",
    title: "Tax Benefits for DPIIT-Recognised Startups",
    description:
      "A plain-English breakdown of 80-IAC, Angel Tax exemption, capital gains relief, and GST benefits available to recognised Indian startups.",
    readTime: "9 min read",
    source: "Startup India / Income Tax Act",
    relatedCategories: ["Government Schemes"],
    sections: [
      {
        id: "overview",
        heading: "Overview",
        body: "DPIIT recognition opens the door to a suite of tax benefits under the Income Tax Act, 1961. The most valuable is the Section 80-IAC income tax holiday — three consecutive years of zero tax on profits. But there are four other significant reliefs: Angel Tax exemption, capital gains exemption, ESOP tax deferral, and carry-forward of losses. Together, these can save a high-growth startup crores in its first decade.",
      },
      {
        id: "80iac",
        heading: "Section 80-IAC: Income Tax Holiday",
        body: "Under Section 80-IAC, a DPIIT-recognised startup can claim 100% deduction on profits for any 3 consecutive years out of the first 10 years from incorporation. This means zero corporate tax on those profits. To claim this, you must apply separately to the Inter-Ministerial Board (IMB) — DPIIT recognition alone is not enough.\n\nEligibility: incorporated after April 1, 2016; all three years must fall within the 10-year window from incorporation; the startup must be an eligible business (not just a scalable model — it must be working on innovation or development). The IMB evaluates applications and approvals typically take 3–6 months.",
        bullets: [
          "100% deduction on profits for 3 consecutive years out of 10",
          "Apply to Inter-Ministerial Board (IMB) separately from DPIIT recognition",
          "Must be incorporated after April 1, 2016",
          "Eligible business: must involve innovation or development",
        ],
      },
      {
        id: "angel-tax",
        heading: "Angel Tax Exemption (Section 56)",
        body: "Section 56(2)(viib) of the Income Tax Act — commonly called the Angel Tax — taxes the premium received on share issuances above fair market value as 'income from other sources.' For a seed-stage startup raising money at a valuation higher than book value, this can be devastating.\n\nDPIIT-recognised startups are exempt from Angel Tax on investments up to ₹25 crore from resident investors (increased from ₹10 crore in 2019). Investments from SEBI-registered funds, AIFs (Category I and II), and from non-residents are fully exempt with no cap. This protection is automatic once you have DPIIT recognition — no separate application needed.",
      },
      {
        id: "capital-gains",
        heading: "Capital Gains Exemptions",
        body: "Section 54EE allows an individual or HUF to claim exemption on long-term capital gains of up to ₹50 lakh by investing in eligible funds set up by DPIIT-notified funds of funds. The investment must be held for at least 3 years.\n\nSection 54GB allows a taxpayer to claim exemption on long-term capital gains arising from the transfer of residential property if the proceeds are invested in equity of an eligible startup. This is particularly useful for founders who want to reinvest property sale proceeds into their own or another's startup.",
      },
      {
        id: "esop",
        heading: "ESOP Tax Deferral",
        body: "For startups recognised by DPIIT, employees are not taxed on ESOPs at the time of exercise (i.e., when they convert their options into shares). Tax is deferred to the earliest of: 5 years from exercise date, the date of leaving the company, or the date of selling the shares. This removes the painful cash tax burden employees face when exercising options in a liquid-poor startup.",
      },
      {
        id: "gst",
        heading: "GST and Other Benefits",
        body: "While there is no blanket GST exemption for startups, DPIIT-recognised startups are eligible for self-certification under 9 labour and 3 environmental laws — reducing the compliance burden. Startups exporting services can also benefit from IGST exemption on import of certain services under Export Promotion Capital Goods (EPCG) and advance authorisation schemes.",
      },
    ],
  },
  {
    slug: "business-entities",
    title: "Types of Business Entities in India",
    description:
      "Private Limited Company, LLP, OPC, or Partnership — which structure is right for your startup? A plain comparison with costs, compliance, and funding implications.",
    readTime: "8 min read",
    source: "Startup India",
    relatedCategories: ["Government Schemes"],
    sections: [
      {
        id: "overview",
        heading: "Why Your Structure Matters",
        body: "The legal structure you choose affects your ability to raise funding, your personal liability, your tax rate, compliance requirements, and how easily you can bring in co-founders or employees with equity. Most investors require a Private Limited Company before they will write a cheque — but for solo founders or services businesses, an LLP or OPC may be simpler and cheaper to run.\n\nChoose your structure before approaching any investor or applying for government schemes. Changing your structure later (e.g., converting an LLP to a Pvt Ltd) is possible but involves legal cost and delay.",
      },
      {
        id: "pvt-ltd",
        heading: "Private Limited Company",
        body: "The most common structure for funded startups. A Pvt Ltd company is a separate legal entity from its founders, limiting personal liability to the amount invested. It can have 2–200 shareholders, issue ESOPs, and raise equity from VCs and angels who become shareholders.\n\nCompliance is heavier than alternatives: annual filing with the Ministry of Corporate Affairs (MCA), statutory audit, quarterly board meetings, and maintenance of statutory registers. Minimum two directors and two shareholders are required at incorporation. Registration cost: approximately ₹7,000–₹15,000 excluding professional fees. Annual compliance: ₹15,000–₹50,000.",
        bullets: [
          "Best for: startups planning to raise VC/angel funding",
          "Limits founders' personal liability",
          "Can issue ESOPs to employees",
          "Requires: 2+ directors, 2+ shareholders",
          "Annual compliance: MCA filings, statutory audit, board minutes",
        ],
      },
      {
        id: "llp",
        heading: "Limited Liability Partnership (LLP)",
        body: "An LLP combines the flexibility of a partnership with limited liability protection. Partners are not personally liable for the debts of the LLP beyond their capital contribution. It is simpler and cheaper to run than a Pvt Ltd company — no mandatory audit below ₹40 lakh turnover, fewer MCA filings, and no dividend distribution tax.\n\nThe critical limitation: investors cannot become shareholders in an LLP — they would have to become 'partners,' which has different legal implications. VCs and institutional investors will not invest in an LLP. Best suited to services-led businesses, consulting firms, or early-stage teams not yet planning equity fundraising. Can be converted to a Pvt Ltd later.",
        bullets: [
          "Best for: services businesses, pre-fundraise stage",
          "Lower compliance than Pvt Ltd",
          "Cannot issue ESOPs or raise VC equity",
          "Registration cost: ~₹5,000–₹10,000",
        ],
      },
      {
        id: "opc",
        heading: "One Person Company (OPC)",
        body: "Introduced in the Companies Act 2013, an OPC allows a single founder to have a company structure with limited liability without needing a second director or shareholder. There is one nominee required (who takes over if the founder dies or is incapacitated).\n\nMandatory conversion to a Pvt Ltd is required if paid-up share capital exceeds ₹50 lakh or turnover crosses ₹2 crore. An OPC cannot raise equity from external investors. Useful for solo founders who want limited liability protection before they bring on a co-founder.",
        bullets: [
          "Best for: solo founders in early stage",
          "Single director and shareholder allowed",
          "Must convert to Pvt Ltd above ₹50L capital or ₹2Cr turnover",
          "Cannot raise equity funding",
        ],
      },
      {
        id: "partnership",
        heading: "Partnership Firm",
        body: "A traditional partnership firm is the simplest and cheapest to set up (under ₹3,000) but offers no limited liability — partners are personally liable for all firm debts. There is no separate legal identity. It cannot raise equity funding and is not eligible for DPIIT recognition.\n\nFor startups, a partnership firm is rarely advisable unless it is a very short-term arrangement before formal incorporation. Unlimited personal liability is too risky once the business starts signing contracts or taking on credit.",
      },
      {
        id: "which-to-choose",
        heading: "Which Structure Should You Choose?",
        body: "The answer depends on one question: do you plan to raise equity funding within the next 12–18 months?\n\nIf yes → Private Limited Company. Register early, even before product-market fit, because investors expect it and converting later costs time and legal fees.\n\nIf no (bootstrapped, services-led, or solo founder) → LLP or OPC depending on whether you have a co-founder. Both offer limited liability at lower compliance cost.\n\nAll three (Pvt Ltd, LLP, OPC) are eligible for DPIIT recognition, which is essential for government scheme access. A plain partnership firm is not.",
      },
    ],
  },
  {
    slug: "seed-fund-scheme",
    title: "Startup India Seed Fund Scheme: Complete Guide",
    description:
      "Everything you need to know about SISFS — how much you can get, which incubators to apply through, what the money can be used for, and how to apply.",
    readTime: "6 min read",
    source: "Startup India / DPIIT",
    relatedCategories: ["Government Schemes", "Grants"],
    sections: [
      {
        id: "what-is-sisfs",
        heading: "What is the Startup India Seed Fund Scheme?",
        body: "The Startup India Seed Fund Scheme (SISFS) was launched in 2021 with a corpus of ₹945 crore to provide financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization. The scheme runs through a network of government-approved incubators across India.\n\nThe government does not give money directly to startups. Instead, it grants funds to empanelled incubators (currently 300+), which then disburse to eligible startups in their portfolio. This means you must first get into an approved incubator to access the scheme.",
      },
      {
        id: "how-much",
        heading: "How Much Can You Get?",
        body: "The scheme provides up to ₹20 lakh as a grant for validation of proof of concept, prototype development, or product trials. For market entry, commercialization, or scaling, startups can receive up to ₹50 lakh — disbursed as convertible debentures or debt or debt-linked instruments.\n\nThe ₹20 lakh grant does not need to be repaid. The ₹50 lakh tranche is a soft loan or debenture — terms are set by the individual incubator within DPIIT guidelines.",
        bullets: [
          "Up to ₹20 lakh: grant (non-repayable) for PoC / prototype / trials",
          "Up to ₹50 lakh: convertible debenture / debt for market entry / scale",
          "Total maximum: ₹70 lakh per startup",
          "Disbursed through empanelled incubators, not directly by government",
        ],
      },
      {
        id: "eligibility",
        heading: "Eligibility",
        bullets: [
          "Must be DPIIT-recognised at the time of application",
          "Startup should be less than 2 years old at the time of application (for PoC grant) or less than 5 years old (for commercialization tranche)",
          "Must not have received more than ₹10 lakh in monetary support from any government scheme (for PoC grant)",
          "Must be associated with an SISFS-empanelled incubator",
          "Promoters must not be defaulters with any bank",
        ],
        body: "",
      },
      {
        id: "how-to-apply",
        heading: "How to Apply",
        body: "Step 1: Get DPIIT recognition (see our guide on DPIIT Recognition).\n\nStep 2: Find an empanelled incubator. The full list is on seedfund.startupindia.gov.in/incubators. Filter by sector and state to find relevant ones.\n\nStep 3: Apply to join the incubator. Each incubator has its own selection process — typically a pitch deck, an application form, and an interview. Most incubators run cohort-based selection.\n\nStep 4: Once accepted, the incubator applies to the SISFS portal on your behalf, and funds are disbursed in tranches based on milestones.",
      },
      {
        id: "use-of-funds",
        heading: "What Can the Money Be Used For?",
        bullets: [
          "Salaries (limited — typically up to 50% of grant)",
          "Equipment, tools, and raw materials for prototyping",
          "Intellectual property filing fees",
          "Third-party testing, validation, and certification",
          "Market research and customer discovery",
          "Marketing and sales for initial market entry (commercialization tranche)",
        ],
        body: "Funds cannot be used for real estate, non-startup investments, or repayment of existing debt. Incubators typically require quarterly utilization reports.",
      },
    ],
  },
  {
    slug: "government-schemes",
    title: "Every Major Government Scheme for Indian Startups",
    description:
      "MAARG, Credit Guarantee, Fund of Funds, WEP, Atal Innovation Mission — a single-page reference to all the major central government programs and what they actually offer.",
    readTime: "10 min read",
    source: "Startup India / DPIIT",
    relatedCategories: ["Government Schemes", "Incubators", "Investor Programs"],
    sections: [
      {
        id: "sisfs",
        heading: "Startup India Seed Fund Scheme (SISFS)",
        body: "Corpus: ₹945 crore. Provides up to ₹20 lakh (grant) for PoC/prototype and up to ₹50 lakh (convertible debt) for market entry — disbursed through 300+ empanelled incubators. For startups under 5 years old with DPIIT recognition. See our full guide: Startup India Seed Fund Scheme.",
      },
      {
        id: "maarg",
        heading: "MAARG Mentorship Portal",
        body: "MAARG (Mentorship, Advisory, Assistance, Resilience and Growth) is a national mentorship platform launched by Startup India to connect startups with expert mentors. It is free and open to all DPIIT-recognised startups.\n\nThe portal has 900+ mentors across 150+ domains including product, legal, finance, marketing, and deep tech. Startups apply for a specific mentor, and sessions are typically 1–2 hours. Unlike paid mentorship programs, MAARG mentors are not paid — they participate voluntarily. Apply at startupindia.gov.in.",
      },
      {
        id: "credit-guarantee",
        heading: "Credit Guarantee Fund Scheme for Startups (CGSS)",
        body: "Managed by the National Credit Guarantee Trustee Company (NCGTC), CGSS provides credit guarantees to loans extended by scheduled commercial banks, NBFCs, and Venture Debt Funds to DPIIT-recognised startups. The maximum guarantee is ₹20 crore per startup (raised from ₹10 crore in 2023).\n\nCGSS does not give money directly — it guarantees the loan, reducing the lender's risk and improving startup access to formal debt. Coverage is either transaction-based or umbrella-based. Eligible instruments: venture debt, working capital, subordinated debt, debentures, and other fund-based facilities.",
        bullets: [
          "Maximum guarantee: ₹20 crore per startup",
          "Operated through banks, NBFCs, and Venture Debt Funds",
          "Covers venture debt, working capital, debentures",
          "Startup must be DPIIT-recognised",
        ],
      },
      {
        id: "fund-of-funds",
        heading: "Fund of Funds for Startups (FFS)",
        body: "The Fund of Funds for Startups is a ₹10,000 crore corpus managed by SIDBI (Small Industries Development Bank of India) that invests in SEBI-registered AIFs (Alternative Investment Funds), which in turn invest in startups. The government does not invest directly in startups — it backs the funds that invest in them.\n\nOver 100 SEBI-registered AIFs have received FFS commitment, which they use to raise private capital (2:1 or higher leverage). If a VC fund you are speaking to has received FFS backing, it is a signal of DPIIT endorsement.",
      },
      {
        id: "wep",
        heading: "Women Entrepreneurship Platform (WEP)",
        body: "WEP is a unified access portal for women entrepreneurs, aggregating resources from central ministries, state governments, and private sector partners. It provides access to: funding connect (WEP lists women-focused investors and grants), skilling and capability programs, mentorship from 500+ women leaders, and market linkages through government e-marketplace (GeM).\n\nWEP-linked schemes include financial support from Mudra Yojana (up to ₹10 lakh for women micro-entrepreneurs), and the Stand-Up India scheme (up to ₹1 crore for women SC/ST entrepreneurs). Access at startupindia.gov.in.",
      },
      {
        id: "aim",
        heading: "Atal Innovation Mission (AIM) — Incubation",
        body: "Launched by NITI Aayog, AIM operates Atal Incubation Centres (AICs) and Atal Community Innovation Centres (ACICs) across India. AICs receive up to ₹10 crore in government grants and provide office space, equipment, mentorship, and seed funding to startups in their portfolio. There are 72+ AICs operational across India.\n\nFor startups, getting into an AIM-backed AIC is a strong signal and provides both physical resources and DPIIT-network access. Apply through the individual AIC's website — AIM does not take direct startup applications.",
      },
      {
        id: "nasscom-10k",
        heading: "NASSCOM 10K Startups",
        body: "India's largest tech startup incubation program, backed by NASSCOM (India's IT industry association). Provides incubation, mentorship, market access, and connections to NASSCOM's 3,000+ member companies. Startups get co-working space, cloud credits (AWS, Azure, GCP), legal support, and investor introductions.\n\nFocus on tech startups — deep tech, enterprise SaaS, AI/ML, cybersecurity, and mobility. Applications are rolling with cohort-based selection. Revenue and early traction preferred but not mandatory.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getNextGuide(slug: string): Guide | undefined {
  const idx = guides.findIndex((g) => g.slug === slug);
  return idx >= 0 && idx < guides.length - 1 ? guides[idx + 1] : undefined;
}
