import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-container-high w-full pt-12 pb-24">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-7xl mx-auto px-6 text-xs leading-loose">
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">
            Customer Service
          </h4>
          <ul className="flex flex-col gap-1 text-outline">
            <li><a className="hover:text-primary" href="#">Help Centre</a></li>
            <li><a className="hover:text-primary" href="#">Shopee Blog</a></li>
            <li><a className="hover:text-primary" href="#">Shopee Mall</a></li>
            <li><a className="hover:text-primary" href="#">Payment Methods</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">
            About Shopee
          </h4>
          <ul className="flex flex-col gap-1 text-outline">
            <li><a className="hover:text-primary" href="#">About Us</a></li>
            <li><a className="hover:text-primary" href="#">Shopee Careers</a></li>
            <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">
            Payment
          </h4>
          <div className="flex flex-wrap gap-2">
            <div className="w-10 h-6 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-outline">VISA</div>
            <div className="w-10 h-6 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-outline">MC</div>
            <div className="w-10 h-6 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-outline">PP</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">
            Logistics
          </h4>
          <div className="flex flex-wrap gap-2">
            <div className="w-10 h-6 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-outline">SPX</div>
            <div className="w-10 h-6 bg-white rounded shadow-sm flex items-center justify-center text-[8px] font-bold text-outline">DHL</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">
            Follow Us
          </h4>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">
              social_leaderboard
            </span>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">
              photo_camera
            </span>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">
              video_library
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-surface-container-high flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-outline text-[10px]">© 2024 Shopee. All Rights Reserved.</div>
        <Link href="/" className="font-bold text-shopee">Shopee</Link>
      </div>
    </footer>
  );
}
