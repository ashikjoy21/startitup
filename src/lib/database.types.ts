export type OpportunityStatus = "published" | "archived" | "expired" | "unverified";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type SubmissionType = "new" | "edit" | "report";

export type DbOpportunity = {
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
  source_url: string | null;
  tags: string[];
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
  published_at: string;
  audience: string[];
  kind: string | null;
  organization_id: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | null;
  locations: string[];
  country: string | null;
  india_eligible: boolean | null;
  skills: string[];
  degrees: string[];
  streams: string[];
  grad_year_min: number | null;
  grad_year_max: number | null;
  experience_min: number | null;
  experience_max: number | null;
  pay_min: number | null;
  pay_max: number | null;
  pay_currency: string | null;
  pay_period: "hour" | "month" | "year" | "total" | null;
  posted_at: string | null;
  deadline_at: string | null;
  last_verified_at: string | null;
  apply_url: string | null;
  notice_number: string | null;
  review_state: "ok" | "needs_review" | "rejected";
  review_reasons: string[];
  review_locked: boolean;
  source_rank: number;
};

export type DbCategory = {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
};

export type DbSubmission = {
  id: string;
  submission_type: SubmissionType;
  opportunity_id: string | null;
  name: string;
  org: string | null;
  short: string | null;
  description: string | null;
  category: string | null;
  industry: string | null;
  stage: string | null;
  location: string | null;
  amount: string | null;
  deadline: string | null;
  eligibility: string | null;
  source_url: string | null;
  submitter_email: string | null;
  submitter_name: string | null;
  notes: string | null;
  status: SubmissionStatus;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
};

export type DbProfile = {
  id: string;
  stage: string | null;
  sector: string | null;
  funding_status: string | null;
  startup_name: string | null;
  location: string | null;
  team_size: number | null;
  funding_raised: string | null;
  incorporated: boolean;
  dpiit_recognized: boolean;
  women_led: boolean;
  student_led: boolean;
};

export type SavedStatus = "saved" | "applied" | "under_review" | "won";

export type DbSavedOpportunity = {
  user_id: string;
  opportunity_id: string;
  status: SavedStatus;
  created_at: string;
  opportunities: DbOpportunity | null;
};
