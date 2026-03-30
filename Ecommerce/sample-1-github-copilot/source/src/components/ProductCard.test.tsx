import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/components/ProductCard";
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
const mockAddToCart = jest.fn();

beforeEach(() => {
  mockAddToCart.mockClear();
  mockUseCart.mockReturnValue({
    items: [],
    isOpen: false,
    count: 0,
    total: 0,
    addToCart: mockAddToCart,
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    openCart: jest.fn(),
    closeCart: jest.fn(),
  } as ReturnType<typeof useCart>);
});

const baseProduct: Product = {
  id: "p1",
  name: "Razer Gaming Mouse",
  description: "High precision gaming mouse",
  price: 59.9,
  original_price: 70.0,
  discount_percent: 15,
  image_url: "/mouse.jpg",
  category: "Electronics",
  sold_count: 3400,
  stock: 50,
  is_flash_sale: false,
  is_mall: false,
  rating: 4.8,
  review_count: 200,
  is_new: false,
  created_at: "2025-01-01",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Razer Gaming Mouse")).toBeInTheDocument();
  });

  it("renders price formatted to 2 decimal places", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("$59.90")).toBeInTheDocument();
  });

  it("renders discount badge when discount_percent > 0", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("does not render discount badge when discount_percent is null", () => {
    render(<ProductCard product={{ ...baseProduct, discount_percent: null }} />);
    expect(screen.queryByText(/-\d+%/)).toBeNull();
  });

  it("renders 'Mall' badge when is_mall is true", () => {
    render(<ProductCard product={{ ...baseProduct, is_mall: true }} />);
    expect(screen.getByText("Mall")).toBeInTheDocument();
  });

  it("renders 'New' badge when is_new is true and is_mall is false", () => {
    render(<ProductCard product={{ ...baseProduct, is_new: true, is_mall: false }} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("does not render 'New' badge when is_mall is true", () => {
    render(<ProductCard product={{ ...baseProduct, is_new: true, is_mall: true }} />);
    expect(screen.queryByText("New")).toBeNull();
  });

  it("formats sold count >= 1000 as 'Sold Xk'", () => {
    render(<ProductCard product={{ ...baseProduct, sold_count: 3400 }} />);
    expect(screen.getByText("Sold 3.4k")).toBeInTheDocument();
  });

  it("formats sold count < 1000 as 'Sold X'", () => {
    render(<ProductCard product={{ ...baseProduct, sold_count: 856 }} />);
    expect(screen.getByText("Sold 856")).toBeInTheDocument();
  });

  it("renders ADD TO CART button", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("calls addToCart with the product when button is clicked", () => {
    render(<ProductCard product={baseProduct} />);
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(baseProduct);
  });
});
