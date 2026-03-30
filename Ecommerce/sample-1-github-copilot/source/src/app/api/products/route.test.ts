/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/products/route";

jest.mock("@/lib/db/products", () => ({
  getDailyProducts: jest.fn(),
}));

import { getDailyProducts } from "@/lib/db/products";
const mockGetDailyProducts = getDailyProducts as jest.MockedFunction<typeof getDailyProducts>;

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/products");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("GET /api/products", () => {
  beforeEach(() => {
    mockGetDailyProducts.mockResolvedValue([]);
  });

  it("calls getDailyProducts with default page=1 and limit=12", async () => {
    await GET(makeRequest());
    expect(mockGetDailyProducts).toHaveBeenCalledWith(12, 1);
  });

  it("passes custom page and limit query params", async () => {
    await GET(makeRequest({ page: "3", limit: "6" }));
    expect(mockGetDailyProducts).toHaveBeenCalledWith(6, 3);
  });

  it("returns JSON array of products", async () => {
    const products = [{ id: "p1", name: "Test" }];
    mockGetDailyProducts.mockResolvedValue(products as never);
    const response = await GET(makeRequest());
    const data = await response.json();
    expect(data).toEqual(products);
  });

  it("returns 200 status", async () => {
    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
  });
});
