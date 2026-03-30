import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/app/login/LoginForm";

const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: password },
  });
}

describe("LoginForm — rendering", () => {
  it("renders email and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("shows 'Log In' button by default", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows 'Sign Up' button after toggling to sign-up mode", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });
});

describe("LoginForm — password visibility", () => {
  it("password input starts as type=password", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when eye icon button is clicked", () => {
    render(<LoginForm />);
    const toggle = screen.getByRole("button", { name: /visibility/i });
    fireEvent.click(toggle);
    expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute("type", "text");
    fireEvent.click(toggle);
    expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute("type", "password");
  });
});

describe("LoginForm — login mode", () => {
  it("calls signInWithPassword with email and password", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fillForm("user@example.com", "password123");
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });
  });

  it("redirects to home on successful login", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fillForm("user@example.com", "password123");
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("displays error message on failed login", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: "Invalid credentials" } });
    render(<LoginForm />);
    fillForm("bad@example.com", "wrongpass");
    fireEvent.submit(screen.getByRole("button", { name: /log in/i }).closest("form")!);
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});

describe("LoginForm — sign up mode", () => {
  function switchToSignUp() {
    // Click the "Sign Up" text-button at the bottom (not the submit button)
    const buttons = screen.getAllByRole("button", { name: /sign up/i });
    // The toggle button is the last one (at the bottom of the form)
    fireEvent.click(buttons[buttons.length - 1]);
  }

  it("calls signUp with email and password", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<LoginForm />);
    switchToSignUp();
    fillForm("new@example.com", "newpass123");
    const submitBtn = screen.getAllByRole("button", { name: /sign up/i })[0];
    fireEvent.submit(submitBtn.closest("form")!);
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "newpass123",
      });
    });
  });

  it("shows confirmation message on successful sign up", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<LoginForm />);
    switchToSignUp();
    fillForm("new@example.com", "newpass123");
    const submitBtn = screen.getAllByRole("button", { name: /sign up/i })[0];
    fireEvent.submit(submitBtn.closest("form")!);
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("shows error on failed sign up", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Email already in use" } });
    render(<LoginForm />);
    switchToSignUp();
    fillForm("existing@example.com", "pass");
    const submitBtn = screen.getAllByRole("button", { name: /sign up/i })[0];
    fireEvent.submit(submitBtn.closest("form")!);
    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });
});
