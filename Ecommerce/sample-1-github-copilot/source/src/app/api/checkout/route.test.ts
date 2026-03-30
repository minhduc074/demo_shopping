/**
 * @jest-environment node
 */
import { POST } from "@/app/api/checkout/route";

jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

import { stripe } from "@/lib/stripe";
const mockCreate = stripe.checkout.sessions.create as jest.MockedFunction<
  typeof stripe.checkout.sessions.create
>;

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const sampleItems = [
  { name: "Product A", price: 10.0, quantity: 2, image: "/img.jpg" },
  { name: "Product B", price: 20.0, quantity: 1 },
];

describe("POST /api/checkout", () => {
  it("returns the Stripe checkout URL on success", async () => {
    mockCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session123" } as never);
    const response = await POST(makeRequest({ items: sampleItems }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ url: "https://checkout.stripe.com/session123" });
  });

  it("creates Stripe session with correct line items", async () => {
    mockCreate.mockResolvedValueOnce({ url: "https://stripe.com/x" } as never);
    await POST(makeRequest({ items: sampleItems }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 1000, // 10.00 * 100
            }),
            quantity: 2,
          }),
        ]),
      })
    );
  });

  it("returns 400 when items array is empty", async () => {
    const response = await POST(makeRequest({ items: [] }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when items is missing", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns 500 when Stripe throws an error", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockCreate.mockRejectedValueOnce(new Error("Stripe error"));
    const response = await POST(makeRequest({ items: sampleItems }));
    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
