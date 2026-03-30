import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/lib/cart/context";
import type { Product } from "@/lib/db/products";

// Suppress console errors from useEffect localStorage in tests
beforeEach(() => {
  localStorage.clear();
});

const mockProduct: Product = {
  id: "p1",
  name: "Test Product",
  description: "A test product",
  price: 10.0,
  original_price: 15.0,
  discount_percent: 33,
  image_url: "/img.jpg",
  category: "Electronics",
  sold_count: 100,
  stock: 50,
  is_flash_sale: false,
  is_mall: false,
  rating: 4.5,
  review_count: 20,
  is_new: false,
  created_at: "2025-01-01",
};

const mockProduct2: Product = {
  ...mockProduct,
  id: "p2",
  name: "Second Product",
  price: 20.0,
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("useCart — initial state", () => {
  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useCart — addToCart", () => {
  it("adds a new item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe("p1");
    expect(result.current.items[0].quantity).toBe(1);
  });

  it("increments quantity when adding existing product", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.addToCart(mockProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("opens the cart drawer on add", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useCart — removeFromCart", () => {
  it("removes item by id", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.removeFromCart("p1"));
    expect(result.current.items).toHaveLength(0);
  });

  it("only removes matching item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.addToCart(mockProduct2));
    act(() => result.current.removeFromCart("p1"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe("p2");
  });
});

describe("useCart — updateQuantity", () => {
  it("updates quantity of an item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.updateQuantity("p1", 5));
    expect(result.current.items[0].quantity).toBe(5);
  });

  it("removes item when quantity set to 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.updateQuantity("p1", 0));
    expect(result.current.items).toHaveLength(0);
  });

  it("removes item when quantity set to negative", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.updateQuantity("p1", -1));
    expect(result.current.items).toHaveLength(0);
  });
});

describe("useCart — clearCart", () => {
  it("empties the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.addToCart(mockProduct2));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.total).toBe(0);
  });
});

describe("useCart — openCart / closeCart", () => {
  it("opens and closes the drawer", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.openCart());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.closeCart());
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useCart — derived values", () => {
  it("computes count correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));  // qty 1
    act(() => result.current.addToCart(mockProduct));  // qty 2
    act(() => result.current.addToCart(mockProduct2)); // qty 1
    expect(result.current.count).toBe(3);
  });

  it("computes total correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(mockProduct));  // 10 * 1
    act(() => result.current.addToCart(mockProduct2)); // 20 * 1
    expect(result.current.total).toBe(30);
  });
});

describe("useCart — throws outside provider", () => {
  it("throws when used outside CartProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within CartProvider"
    );
    consoleSpy.mockRestore();
  });
});
