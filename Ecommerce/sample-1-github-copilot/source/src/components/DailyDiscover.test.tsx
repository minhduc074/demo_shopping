import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import DailyDiscover from "@/components/DailyDiscover";
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

beforeEach(() => {
  mockUseCart.mockReturnValue({
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
});

function makeProduct(id: string): Product {
  return {
    id,
    name: `Product ${id}`,
    description: "desc",
    price: 10.0,
    original_price: 15.0,
    discount_percent: 10,
    image_url: "/img.jpg",
    category: "Electronics",
    sold_count: 100,
    stock: 10,
    is_flash_sale: false,
    is_mall: false,
    rating: 4.0,
    review_count: 5,
    is_new: false,
    created_at: "2025-01-01",
  };
}

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => makeProduct(`p${i + 1}`));
}

describe("DailyDiscover", () => {
  it("renders initial products", () => {
    const products = makeProducts(3);
    render(<DailyDiscover initialProducts={products} />);
    expect(screen.getByText("Product p1")).toBeInTheDocument();
    expect(screen.getByText("Product p3")).toBeInTheDocument();
  });

  it("shows 'See More' button", () => {
    render(<DailyDiscover initialProducts={makeProducts(12)} />);
    expect(screen.getByRole("button", { name: /see more/i })).toBeInTheDocument();
  });

  it("fetches more products when 'See More' is clicked", async () => {
    const nextPage = makeProducts(12).map((p, i) => ({
      ...p,
      id: `next-p${i + 1}`,
      name: `Next Product ${i + 1}`,
    }));
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => nextPage,
    } as Response);

    render(<DailyDiscover initialProducts={makeProducts(12)} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /see more/i }));
    });

    expect(screen.getByText("Next Product 1")).toBeInTheDocument();
  });

  it("hides 'See More' button when fewer than 12 products are returned", async () => {
    const fewProducts = makeProducts(5).map((p) => ({ ...p, id: `few-${p.id}` }));
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => fewProducts,
    } as Response);

    render(<DailyDiscover initialProducts={makeProducts(12)} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /see more/i }));
    });

    expect(screen.queryByRole("button", { name: /see more/i })).toBeNull();
  });

  it("shows 'Loading...' text while fetching", async () => {
    let resolvePromise!: (value: unknown) => void;
    const hanging = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    global.fetch = jest.fn().mockReturnValueOnce(hanging);

    render(<DailyDiscover initialProducts={makeProducts(12)} />);
    fireEvent.click(screen.getByRole("button", { name: /see more/i }));

    expect(screen.getByRole("button", { name: /loading/i })).toBeInTheDocument();

    // Resolve the hanging promise inside act so all state updates flush cleanly
    await act(async () => {
      resolvePromise({ json: async () => [] });
    });
  });
});
