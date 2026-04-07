import Image from "next/image";
import Link from "next/link";
import { formatCurrency, percent } from "@/lib/utils";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    category: string;
    description: string;
    price: number;
    compareAtPrice?: number | null;
    image: string;
    inventory: number;
    sold: number;
  };
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const maxStock = product.inventory + product.sold;

  return (
    <article className={`product-card ${className ?? ""}`.trim()}>
      <Link href={`/products/${product.slug}`}>
        <Image src={product.image} alt={product.name} width={900} height={1100} />
      </Link>
      <div className="product-meta">{product.category}</div>
      <div>
        <h3>{product.name}</h3>
        <p className="muted-text" style={{ color: "#5b403b" }}>{product.description}</p>
      </div>
      <div className="price-row">
        <div className="price">{formatCurrency(product.price)}</div>
        {product.compareAtPrice ? <div className="product-meta">{formatCurrency(product.compareAtPrice)}</div> : null}
      </div>
      <div className="flash-bar" style={{ ["--progress" as string]: `${percent(product.sold, maxStock)}%` }}>
        <span />
      </div>
      <div className="price-row">
        <span className="product-meta">Đã bán {product.sold}</span>
        <Link href={`/products/${product.slug}`}>Xem chi tiết</Link>
      </div>
    </article>
  );
}
