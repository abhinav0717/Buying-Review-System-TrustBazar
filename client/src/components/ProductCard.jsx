import { MessageSquare, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars.jsx";

export default function ProductCard({ product, onBuy }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link to={`/products/${product._id}`}>
        <img src={product.imageUrl} alt={product.title} className="h-52 w-full object-cover" loading="lazy" />
      </Link>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-clay">{product.category}</p>
          <Link to={`/products/${product._id}`} className="mt-1 block text-lg font-black text-ink hover:text-mint">
            {product.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="rounded-md bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{product.seller?.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <RatingStars value={product.seller?.ratingAverage || 0} size={13} />
                <span>{product.seller?.ratingCount || 0} reviews</span>
              </div>
            </div>
            <p className="text-lg font-black text-ink">₹{product.price}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onBuy(product._id)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-slate-800">
            <ShoppingCart size={16} /> Buy
          </button>
          <Link to={`/chat/${product.seller?._id}`} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
            <MessageSquare size={16} /> Chat
          </Link>
        </div>
      </div>
    </article>
  );
}

