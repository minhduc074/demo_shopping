import { flashSaleProducts, dailyProducts } from "@/lib/products";

describe("flashSaleProducts", () => {
  it("has exactly 6 items", () => {
    expect(flashSaleProducts).toHaveLength(6);
  });

  it("every item has required fields", () => {
    for (const p of flashSaleProducts) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(typeof p.price).toBe("number");
      expect(p.image).toBeTruthy();
      expect(p.sold).toBeTruthy();
    }
  });

  it("has unique ids", () => {
    const ids = flashSaleProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("dailyProducts", () => {
  it("has exactly 12 items", () => {
    expect(dailyProducts).toHaveLength(12);
  });

  it("every item has required fields", () => {
    for (const p of dailyProducts) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(typeof p.price).toBe("number");
      expect(p.image).toBeTruthy();
      expect(p.sold).toBeTruthy();
    }
  });

  it("has unique ids", () => {
    const ids = dailyProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
