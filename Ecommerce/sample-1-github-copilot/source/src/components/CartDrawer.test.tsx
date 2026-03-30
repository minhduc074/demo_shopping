import { render, screen, fireEvent } from "@testing-library/react";
import CartDrawer from "@/components/CartDrawer";
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
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockCloseCart = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();

const mockProduct: Product = {
  id: "p1",
  name: "Test Product",
  description: "desc",
  price: 25.0,
  original_price: 30.0,
  discount_percent: 17,
  image_url: "/img.jpg",
  category: "Electronics",
  sold_count: 100,
  stock: 10,
  is_flash_sale: false,
  is_mall: false,
  rating: 4.5,
  review_count: 10,
  is_new: false,
  created_at: "2025-01-01",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function buildMock(overrides: Partial<ReturnType<typeof useCart>>) {
  return {
    items: [],
    isOpen: false,
    count: 0,
    total: 0,
    addToCart: jest.fn(),
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    clearCart: jest.fn(),
    openCart: jest.fn(),
    closeCart: mockCloseCart,
    ...overrides,
  } as ReturnType<typeof useCart>;
}

describe("CartDrawer — closed", () => {
  it("is not visible when isOpen is false", () => {
    mockUseCart.mockReturnValue(buildMock({ isOpen: false }));
    render(<CartDrawer />);
    // Drawer div has translate-x-full class when closed
    const drawer = screen.getByText(/Cart/).closest(".fixed");
    expect(drawer).toHaveClass("translate-x-full");
  });
});

describe("CartDrawer — empty cart", () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue(buildMock({ isOpen: true, items: [], count: 0, total: 0 }));
  });

  it("shows empty state message", () => {
    render(<CartDrawer />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("does not show checkout footer when empty", () => {
    render(<CartDrawer />);
    expect(screen.queryByText(/Checkout/)).toBeNull();
  });
});

describe("CartDrawer — with items", () => {
  const cartItems = [{ product: mockProduct, quantity: 2 }];

  beforeEach(() => {
    mockUseCart.mockReturnValue(
      buildMock({ isOpen: true, items: cartItems, count: 2, total: 50 })
    );
  });

  it("renders product names", () => {
    render(<CartDrawer />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<CartDrawer />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("renders current quantity", () => {
    render(<CartDrawer />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders subtotal", () => {
    render(<CartDrawer />);
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("calls updateQuantity with decremented value when − is clicked", () => {
    render(<CartDrawer />);
    fireEvent.click(screen.getByText("−"));
    expect(mockUpdateQuantity).toHaveBeenCalledWith("p1", 1);
  });

  it("calls updateQuantity with incremented value when + is clicked", () => {
    render(<CartDrawer />);
    fireEvent.click(screen.getByText("+"));
    expect(mockUpdateQuantity).toHaveBeenCalledWith("p1", 3);
  });

  it("calls removeFromCart when delete button is clicked", () => {
    render(<CartDrawer />);
    // The delete button has a material-symbols span inside
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    if (!deleteButton) {
      // fallback: find by parent structure
      const spans = document.querySelectorAll(".material-symbols-outlined");
      const deleteSpan = Array.from(spans).find((s) => s.textContent === "delete");
      if (deleteSpan?.parentElement) fireEvent.click(deleteSpan.parentElement);
    } else {
      fireEvent.click(deleteButton);
    }
    expect(mockRemoveFromCart).toHaveBeenCalledWith("p1");
  });

  it("has a checkout link pointing to /checkout", () => {
    render(<CartDrawer />);
    const checkoutLink = screen.getByRole("link", { name: /Checkout/i });
    expect(checkoutLink).toHaveAttribute("href", "/checkout");
  });

  it("calls closeCart when backdrop is clicked", () => {
    render(<CartDrawer />);
    const backdrop = document.querySelector(".bg-black\\/40");
    if (backdrop) fireEvent.click(backdrop);
    expect(mockCloseCart).toHaveBeenCalledTimes(1);
  });
});
