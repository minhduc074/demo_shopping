import Link from "next/link";
import CartIcon from "@/components/CartIcon";
import AuthActions from "@/components/AuthActions";

interface HeaderProps {
  variant?: "full" | "login" | "checkout";
}

export default function Header({ variant = "full" }: HeaderProps) {
  if (variant === "login") {
    return (
      <header className="bg-shopee shadow-sm backdrop-blur-md bg-opacity-95 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full px-4 py-4 max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-3xl font-bold text-white tracking-tighter">
              Shopee
            </Link>
            <span className="hidden md:block text-2xl text-white font-medium ml-4">Login</span>
          </div>
          <a className="text-white text-sm hover:text-white/70 transition-opacity" href="#">
            Need help?
          </a>
        </div>
      </header>
    );
  }

  if (variant === "checkout") {
    return (
      <nav className="bg-shopee text-white shadow-sm backdrop-blur-md bg-opacity-95 sticky top-0 z-50">
        <div className="flex flex-col w-full px-4 py-2 max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-white tracking-tighter">
                Shopee
              </Link>
              <div className="hidden md:flex gap-4">
                <span className="text-white/90 text-sm font-medium">Download</span>
                <span className="text-white/90 text-sm font-medium border-l border-white/20 pl-4">
                  Support
                </span>
              </div>
            </div>
            <CartIcon />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <header className="bg-shopee text-white sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="flex flex-col w-full px-4 py-2 max-w-7xl mx-auto">
        <nav className="flex justify-between items-center text-xs py-1">
          <div className="flex gap-4">
            <a className="text-white/90 text-sm font-medium hover:text-white/70 transition-opacity" href="#">
              Download
            </a>
            <a className="text-white/90 text-sm font-medium hover:text-white/70 transition-opacity" href="#">
              Support
            </a>
          </div>
          <AuthActions />
        </nav>

        <div className="flex items-center gap-8 py-3">
          <Link href="/" className="text-2xl font-bold text-white tracking-tighter">
            Shopee
          </Link>
          <div className="flex-1 relative">
            <input
              className="w-full py-2.5 px-4 bg-white text-on-surface rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed ring-inset"
              placeholder="Search for products, brands and shops"
              type="text"
            />
            <button className="absolute right-1 top-1 bottom-1 px-5 bg-shopee hover:bg-primary-dim rounded transition-colors">
              <span className="material-symbols-outlined text-white">search</span>
            </button>
          </div>
          <div className="flex items-center gap-6 text-white">
            <CartIcon />
            <button className="cursor-pointer" type="button" aria-label="Notifications">
              <span className="material-symbols-outlined text-3xl">notifications</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
