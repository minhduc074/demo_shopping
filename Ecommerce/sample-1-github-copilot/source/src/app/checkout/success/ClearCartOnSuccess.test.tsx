import { render } from "@testing-library/react";
import ClearCartOnSuccess from "@/app/checkout/success/ClearCartOnSuccess";
import { useCart } from "@/lib/cart/context";

jest.mock("@/lib/cart/context");

const mockClearCart = jest.fn();
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

let mockSearchParamsGet: (key: string) => string | null;

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: (key: string) => mockSearchParamsGet(key) }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCart.mockReturnValue({
    items: [],
    isOpen: false,
    count: 0,
    total: 0,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: mockClearCart,
    openCart: jest.fn(),
    closeCart: jest.fn(),
  } as ReturnType<typeof useCart>);
});

describe("ClearCartOnSuccess", () => {
  it("calls clearCart when session_id is present", () => {
    mockSearchParamsGet = (key) => (key === "session_id" ? "cs_test_123" : null);
    render(<ClearCartOnSuccess />);
    expect(mockClearCart).toHaveBeenCalledTimes(1);
  });

  it("does not call clearCart when session_id is absent", () => {
    mockSearchParamsGet = () => null;
    render(<ClearCartOnSuccess />);
    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it("renders nothing (returns null)", () => {
    mockSearchParamsGet = () => null;
    const { container } = render(<ClearCartOnSuccess />);
    expect(container).toBeEmptyDOMElement();
  });
});
