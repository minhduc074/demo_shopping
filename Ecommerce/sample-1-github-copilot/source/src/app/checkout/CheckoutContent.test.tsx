import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckoutContent from "@/app/checkout/CheckoutContent";
import { useCart } from "@/lib/cart/context";
import type { Product } from "@/lib/db/products";

jest.mock("@/lib/cart/context");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, unoptimized, sizes, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean; sizes?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

const mockProduct: Product = {
  id: "p1",
  name: "Gaming Mouse",
  description: "desc",
  price: 59.9,
  original_price: 70.0,
  discount_percent: 15,
  image_url: "/mouse.jpg",
  category: "Electronics",
  sold_count: 100,
  stock: 10,
  is_flash_sale: false,
  is_mall: false,
  rating: 4.8,
  review_count: 50,
  is_new: false,
  created_at: "2025-01-01",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCart.mockReturnValue({
    items: [{ product: mockProduct, quantity: 2 }],
    isOpen: false,
    count: 2,
    total: 119.8,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    openCart: jest.fn(),
    closeCart: jest.fn(),
  } as ReturnType<typeof useCart>);
});

describe("CheckoutContent — rendering", () => {
  it("renders cart item names", () => {
    render(<CheckoutContent />);
    expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
  });

  it("renders item unit price", () => {
    render(<CheckoutContent />);
    expect(screen.getByText("$59.90")).toBeInTheDocument();
  });

  it("renders item quantity", () => {
    render(<CheckoutContent />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty cart message when no items", () => {
    mockUseCart.mockReturnValueOnce({
      items: [],
      isOpen: false,
      count: 0,
      total: 0,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      openCart: jest.fn(),
      closeCart: jest.fn(),
    } as ReturnType<typeof useCart>);
    render(<CheckoutContent />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});

describe("CheckoutContent — payment methods", () => {
  it("shows card form fields by default (default method is 'card')", () => {
    render(<CheckoutContent />);
    expect(screen.getByPlaceholderText("XXXX XXXX XXXX XXXX")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MM/YY")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("***")).toBeInTheDocument();
  });

  it("hides card form when 'Cash on Delivery' is selected", () => {
    render(<CheckoutContent />);
    fireEvent.click(screen.getByRole("button", { name: /cash on delivery/i }));
    expect(screen.queryByPlaceholderText("XXXX XXXX XXXX XXXX")).toBeNull();
  });

  it("shows card form again when 'Credit / Debit Card' is re-selected", () => {
    render(<CheckoutContent />);
    fireEvent.click(screen.getByRole("button", { name: /cash on delivery/i }));
    fireEvent.click(screen.getByRole("button", { name: /credit \/ debit card/i }));
    expect(screen.getByPlaceholderText("XXXX XXXX XXXX XXXX")).toBeInTheDocument();
  });
});

describe("CheckoutContent — place order", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = { href: "" };
  });

  it("calls /api/checkout with order items", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://stripe.com/checkout/session123" }),
    } as Response);

    render(<CheckoutContent />);
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("redirects to Stripe URL on successful checkout", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://stripe.com/checkout/session123" }),
    } as Response);

    render(<CheckoutContent />);
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("https://stripe.com/checkout/session123");
    });
  });
});
