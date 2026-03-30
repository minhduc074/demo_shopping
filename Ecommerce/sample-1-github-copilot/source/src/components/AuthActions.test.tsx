import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AuthActions from "@/components/AuthActions";

// Mock Supabase client
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignOut = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const unsubscribe = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });
});

describe("AuthActions — logged out", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it("renders Login and Register links when not authenticated", async () => {
    render(<AuthActions />);
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });
  });

  it("does not render logout button when not authenticated", async () => {
    render(<AuthActions />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /logout/i })).toBeNull();
    });
  });
});

describe("AuthActions — logged in", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: "user@example.com" } } },
    });
  });

  it("renders the username (email prefix) when authenticated", async () => {
    render(<AuthActions />);
    await waitFor(() => {
      expect(screen.getByText("user")).toBeInTheDocument();
    });
  });

  it("renders Logout button when authenticated", async () => {
    render(<AuthActions />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    });
  });

  it("does not render Login/Register links when authenticated", async () => {
    render(<AuthActions />);
    await waitFor(() => {
      expect(screen.queryByText("Login")).toBeNull();
      expect(screen.queryByText("Register")).toBeNull();
    });
  });

  it("calls signOut and router.refresh when Logout is clicked", async () => {
    mockSignOut.mockResolvedValue({});
    render(<AuthActions />);
    await waitFor(() => screen.getByRole("button", { name: /logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});

describe("AuthActions — auth state changes", () => {
  it("updates UI when auth state changes to logged in", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    let stateChangeCallback: (event: string, session: unknown) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb) => {
      stateChangeCallback = cb;
      return { data: { subscription: { unsubscribe } } };
    });

    render(<AuthActions />);
    await waitFor(() => expect(screen.getByText("Login")).toBeInTheDocument());

    // Simulate auth state change
    await act(async () => {
      stateChangeCallback("SIGNED_IN", { user: { email: "new@example.com" } });
    });
    expect(screen.getByText("new")).toBeInTheDocument();
  });
});
