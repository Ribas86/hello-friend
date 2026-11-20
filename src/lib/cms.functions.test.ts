import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Сайт не должен падать, если CMS недоступна: отдаёт копию или встроенные данные.
describe("данные сайта при сбое CMS", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("DIRECTUS_URL", "http://cms.invalid");
    vi.stubEnv("DIRECTUS_TOKEN", "test");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("при первом запуске без CMS отдаёт встроенные данные, а не ошибку", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadContent } = await import("./cms.functions");

    const content = await loadContent();

    expect(content.source).toBe("static");
    expect(content.services.length).toBeGreaterThan(0);
    expect(content.directions.length).toBeGreaterThan(0);
  });

  it("после сбоя не опрашивает CMS на каждом запросе", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("timeout"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadContent } = await import("./cms.functions");

    await loadContent();
    const callsAfterFirst = fetchMock.mock.calls.length;
    await loadContent();
    await loadContent();

    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });
});
