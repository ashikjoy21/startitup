import { describe, expect, it } from "vitest";
import { TELEGRAM_GROUP_URL, telegramTopic } from "./telegram";

describe("telegramTopic", () => {
  it("routes zero experience and early career kinds to Freshers first", () => {
    expect(telegramTopic({ roleFamily: "Data & AI", kind: "job", experienceMin: 0 })).toEqual({
      name: "Freshers & Internships",
      url: `${TELEGRAM_GROUP_URL}/16`,
    });
    expect(
      telegramTopic({ roleFamily: "Software & IT", kind: "internship", experienceMin: 3 }).name,
    ).toBe("Freshers & Internships");
  });

  it("maps role families to their shared category topics", () => {
    expect(
      telegramTopic({ roleFamily: "Design & Creative", kind: "job", experienceMin: null }),
    ).toEqual({
      name: "Product & Design",
      url: `${TELEGRAM_GROUP_URL}/20`,
    });
    expect(
      telegramTopic({ roleFamily: "Finance, Banking & Insurance", kind: "job", experienceMin: 2 })
        .url,
    ).toBe(`${TELEGRAM_GROUP_URL}/22`);
  });

  it("routes all other role families to Other Roles", () => {
    expect(
      telegramTopic({ roleFamily: "Legal & Compliance", kind: "job", experienceMin: null }),
    ).toEqual({
      name: "Other Roles",
      url: `${TELEGRAM_GROUP_URL}/27`,
    });
  });
});
