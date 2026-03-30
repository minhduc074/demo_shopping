/**
 * @jest-environment node
 */
import { GET } from "@/app/auth/callback/route";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@/lib/supabase/server";

const mockExchangeCode = jest.fn();

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/auth/callback");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue({
      auth: { exchangeCodeForSession: mockExchangeCode },
    });
  });

  it("redirects to '/' when code exchange succeeds and no next param", async () => {
    mockExchangeCode.mockResolvedValueOnce({ error: null });
    const response = await GET(makeRequest({ code: "valid-code" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to 'next' param when code exchange succeeds", async () => {
    mockExchangeCode.mockResolvedValueOnce({ error: null });
    const response = await GET(makeRequest({ code: "valid-code", next: "/dashboard" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects to /login when code exchange fails", async () => {
    mockExchangeCode.mockResolvedValueOnce({ error: new Error("Invalid code") });
    const response = await GET(makeRequest({ code: "bad-code" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects to /login when no code is provided", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
