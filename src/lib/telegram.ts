export const TELEGRAM_GROUP_URL = "https://t.me/startitupjobs";

const TOPICS: Record<string, { name: string; threadId: number }> = {
  "Software & IT": { name: "Software & IT", threadId: 17 },
  "Data & AI": { name: "Data & AI", threadId: 18 },
  "Engineering & Technical": { name: "Engineering & Technical", threadId: 19 },
  "Product & Project Management": { name: "Product & Design", threadId: 20 },
  "Design & Creative": { name: "Product & Design", threadId: 20 },
  "Sales & Business Development": { name: "Sales & Marketing", threadId: 21 },
  "Marketing & Communications": { name: "Sales & Marketing", threadId: 21 },
  "Finance, Banking & Insurance": { name: "Finance & Banking", threadId: 22 },
  "Operations & Supply Chain": { name: "Operations & Supply Chain", threadId: 23 },
  "HR & Recruitment": { name: "HR & Recruitment", threadId: 24 },
  "Customer Support & Success": { name: "Customer Support", threadId: 25 },
  "Consulting & Strategy": { name: "Consulting & Strategy", threadId: 26 },
};

const FRESHER_KINDS = new Set(["internship", "graduate_program", "apprenticeship"]);

export function telegramTopic({
  roleFamily,
  kind,
  experienceMin,
}: {
  roleFamily: string | null | undefined;
  kind: string | null | undefined;
  experienceMin: number | null | undefined;
}): { name: string; url: string } {
  if (experienceMin === 0 || (kind && FRESHER_KINDS.has(kind))) {
    return { name: "Freshers & Internships", url: `${TELEGRAM_GROUP_URL}/16` };
  }

  const topic = roleFamily ? TOPICS[roleFamily] : undefined;
  if (topic) return { name: topic.name, url: `${TELEGRAM_GROUP_URL}/${topic.threadId}` };
  return { name: "Other Roles", url: `${TELEGRAM_GROUP_URL}/27` };
}
