import { useRouteContext } from "@tanstack/react-router";
import type { SiteContent } from "./cms.functions";

// Данные сайта (услуги, FAQ, компания) загружаются один раз в корневом маршруте.
export function useSite(): SiteContent {
  return useRouteContext({ from: "__root__" }).site;
}
