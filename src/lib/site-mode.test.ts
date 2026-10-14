import { describe, expect, it } from "vitest";
import { modeForPathname, parseSiteModeCookie } from "./site-mode";

describe("site mode", () => {
  it.each([
    ["/career", "career"],
    ["/jobs", "career"],
    ["/jobs/", "career"],
    ["/saved", "career"],
    ["/funding", "business"],
    ["/", "business"],
  ] as const)("maps %s to %s", (pathname, mode) => {
    expect(modeForPathname(pathname)).toBe(mode);
  });

  it("reads only supported mode cookie values", () => {
    expect(parseSiteModeCookie("other=x; siu_mode=career")).toBe("career");
    expect(parseSiteModeCookie("siu_mode=business")).toBe("business");
    expect(parseSiteModeCookie("siu_mode=invalid")).toBeNull();
    expect(parseSiteModeCookie(null)).toBeNull();
  });
});
