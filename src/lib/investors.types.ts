export type InvestorType = "Angel" | "VC" | "Family Office" | "Corporate VC" | "Syndicate" | "Other";

export type SectorSource = "manual" | "meity" | "funding_article" | "firecrawl" | "heuristic";

export interface StartupSectorFields {
  sector: string | null;
  sector_verified?: boolean;
  sector_source?: SectorSource;
  sector_evidence_url?: string | null;
}

export interface InvestorListItem {
  id: string;
  name: string;
  type: InvestorType;
  website: string | null;
  linkedin: string | null;
  location: string | null;
  investment_stages: string[];
  sector_focus: string[];
  portfolio_count: number;
}

export interface PortfolioStartup extends StartupSectorFields {
  id: string;
  name: string;
}

export interface FundingRoundListItem {
  id: string;
  startup_id: string;
  startup_name: string;
  startup_sector: string | null;
  startup_sector_verified?: boolean;
  startup_sector_source?: SectorSource;
  startup_sector_evidence_url?: string | null;
  round_type: string;
  amount_text: string | null;
  amount_usd: number | null;
  announced_date: string | null;
  source_url: string;
  article_excerpt?: string | null;
  investors: string[];
}

export interface StartupListItem extends StartupSectorFields {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  state?: string | null;
  founding_year?: number | null;
  funding_round_count: number;
  latest_round_date: string | null;
  description?: string | null;
}

export interface StartupDetail extends StartupListItem {
  state: string | null;
  founding_year: number | null;
  funding_rounds: FundingRoundListItem[];
  investors: string[];
}

export interface InvestorUiBundle {
  built_at: string;
  graph_built_at: string | null;
  counts: {
    investors: number;
    funding_rounds: number;
    startups: number;
    funded_startups?: number;
    sectors_verified?: number;
    sectors_verified_funded?: number;
  };
  investors: InvestorListItem[];
  funding_rounds: FundingRoundListItem[];
  funded_startups: StartupListItem[];
  portfolios: Record<string, PortfolioStartup[]>;
}

export interface InvestorDetail extends InvestorListItem {
  portfolio: PortfolioStartup[];
  recent_rounds: FundingRoundListItem[];
  /** Sectors inferred from portfolio when explicit sector_focus is empty */
  derived_sector_focus: string[];
  /** Portfolio companies grouped by sector with counts */
  sector_breakdown: { sector: string; count: number }[];
}
