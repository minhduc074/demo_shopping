import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFlashSaleProducts, getDailyProducts } from "@/lib/db/products";
import DailyDiscover from "@/components/DailyDiscover";

export const revalidate = 60;

const categories = [
  { icon: "apparel", label: "Fashion" },
  { icon: "devices", label: "Electronics" },
  { icon: "face", label: "Beauty" },
  { icon: "chair", label: "Home & Living" },
  { icon: "sports_esports", label: "Gaming" },
  { icon: "local_mall", label: "Supermarket" },
  { icon: "watch", label: "Accessories" },
  { icon: "toys", label: "Toys & Kids" },
];

export default async function Home() {
  const [flashProducts, dailyProducts] = await Promise.all([
    getFlashSaleProducts(6),
    getDailyProducts(12),
  ]);
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-24">
        {/* Hero Banner */}
        <section className="grid grid-cols-12 gap-2 mb-8 h-[320px]">
          <div className="col-span-8 relative overflow-hidden rounded bg-surface-container-low shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80"
              alt="Summer Super Sale"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center p-12">
              <div className="max-w-md">
                <h2 className="text-white text-5xl font-extrabold leading-tight mb-4 tracking-tight">
                  SUMMER <br />SUPER SALE
                </h2>
                <p className="text-white/90 text-lg mb-6">Up to 70% Off Everything</p>
                <button className="bg-white text-primary px-8 py-3 font-bold rounded shadow-lg hover:bg-primary-container hover:text-white transition-all">
                  Shop Now
                </button>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-2">
            <div className="flex-1 bg-tertiary-container rounded overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
                alt="Tech Deals"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-tertiary font-bold text-sm bg-white/80 w-fit px-2 py-0.5 rounded mb-2">
                  TECH DEALS
                </span>
                <h3 className="text-on-tertiary-container text-xl font-bold">New Audio Arrivals</h3>
              </div>
            </div>
            <div className="flex-1 bg-secondary-container rounded overflow-hidden relative">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
                alt="Beauty Hub"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-secondary font-bold text-sm bg-white/80 w-fit px-2 py-0.5 rounded mb-2">
                  BEAUTY HUB
                </span>
                <h3 className="text-on-secondary-container text-xl font-bold">Skincare Essentials</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white rounded mb-8 p-4 shadow-sm overflow-x-auto hide-scrollbar">
          <div className="flex justify-between items-center gap-4 min-w-[800px]">
            {categories.map((cat) => (
              <div key={cat.label} className="flex flex-col items-center group cursor-pointer w-24">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-2xl">{cat.icon}</span>
                </div>
                <span className="text-xs text-center font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="bg-white rounded mb-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-surface">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary font-bold">bolt</span>
                <h2 className="text-xl font-bold text-primary uppercase italic tracking-tighter">
                  Flash Sale
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-on-surface text-white font-bold px-1.5 py-0.5 rounded-sm text-sm">01</span>
                <span className="font-bold text-on-surface">:</span>
                <span className="bg-on-surface text-white font-bold px-1.5 py-0.5 rounded-sm text-sm">24</span>
                <span className="font-bold text-on-surface">:</span>
                <span className="bg-on-surface text-white font-bold px-1.5 py-0.5 rounded-sm text-sm">52</span>
              </div>
            </div>
            <a className="text-primary text-sm font-medium hover:underline flex items-center" href="#">
              See All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </a>
          </div>
          <div className="grid grid-cols-6 gap-2 p-4">
            {flashProducts.map((p) => (
              <div key={p.id} className="flex flex-col group cursor-pointer">
                <div className="aspect-square relative overflow-hidden bg-surface mb-2">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="16vw" unoptimized />
                  {p.discount_percent && (
                    <div className="absolute top-0 right-0 bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1">
                      -{p.discount_percent}%
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <div className="text-primary font-bold text-lg leading-none mb-1">
                    ${Number(p.price).toFixed(2)}
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-primary"
                      style={{
                        width: `${Math.min(90, 20 + (p.sold_count / 100))}%`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                      {p.sold_count > 999 ? `${(p.sold_count / 1000).toFixed(1)}k sold` : `${p.sold_count} sold`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Discover */}
        <section className="mb-4 flex items-center gap-2 border-b-4 border-primary pb-2 w-fit">
          <h2 className="text-lg font-bold text-primary uppercase">Daily Discover</h2>
        </section>
        <DailyDiscover initialProducts={dailyProducts} />
      </main>
      <Footer />
    </>
  );
}
