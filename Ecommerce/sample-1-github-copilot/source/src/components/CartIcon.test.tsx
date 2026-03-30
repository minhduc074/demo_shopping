import { render, screen, fireEvent } from "@testing-library/react";
import CartIcon from "@/components/CartIcon";
import { useCart } from "@/lib/cart/context";

jest.mock("@/lib/cart/context");
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

function buildCartMock(count: number, openCart = jest.fn()) {
  return {
    items: [],
    isOpen: false,
    count,
    total: 0,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    openCart,
    closeCart: jest.fn(),
  } as ReturnType<typeof useCart>;
}

describe("CartIcon", () => {
  it("renders without a badge when count is 0", () => {
    mockUseCart.mockReturnValue(buildCartMock(0));
    const { container } = render(<CartIcon />);
    // The count badge span should not be present
    expect(container.querySelector("span.absolute")).toBeNull();
  });

  it("renders the count when count > 0", () => {
    mockUseCart.mockReturnValue(buildCartMock(3));
    render(<CartIcon />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows '99+' when count exceeds 99", () => {
    mockUseCart.mockReturnValue(buildCartMock(100));
    render(<CartIcon />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("shows exact count of 99", () => {
    mockUseCart.mockReturnValue(buildCartMock(99));
    render(<CartIcon />);
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("calls openCart when button is clicked", () => {
    const openCart = jest.fn();
    mockUseCart.mockReturnValue(buildCartMock(1, openCart));
    render(<CartIcon />);
    fireEvent.click(screen.getByRole("button"));
    expect(openCart).toHaveBeenCalledTimes(1);
  });
});
