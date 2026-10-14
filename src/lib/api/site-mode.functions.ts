import { createServerFn } from "@tanstack/react-start";
import { parseSiteModeCookie } from "../site-mode";

export const getPreferredSiteMode = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  return parseSiteModeCookie(getRequest().headers.get("cookie"));
});
