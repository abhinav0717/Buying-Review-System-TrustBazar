import { MessageSquare, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import RatingStars from "../components/RatingStars.jsx";
import { api } from "../services/api.js";
import { selectAuth } from "../store/authSlice.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      const reviewResponse = await api.get(`/reviews/seller/${data.seller._id}`, { params: { limit: 8 } });
      setReviews(reviewResponse.data.items);
    }

    load().catch(() => setNotice("Unable to load product"));
  }, [id]);

  async function buyNow() {
    if (!token) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      await api.post("/orders", { productId: id });
      navigate("/orders");
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to buy product");
    }
  }

  if (!product) {
    return <div className="p-8 text-center text-slate-600">Loading product...</div>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {notice && <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{notice}</div>}

      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <img src={product.imageUrl} alt={product.title} className="max-h-[560px] w-full rounded-lg object-cover shadow-soft" />
        <div className="self-start">
          <p className="text-sm font-bold uppercase tracking-wide text-clay">{product.category}</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{product.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>
          <p className="mt-5 text-3xl font-black text-ink">₹{product.price}</p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-500">Seller</p>
            <div className="mt-3 flex items-center gap-3">
              <img src={product.seller.avatarUrl} alt={product.seller.name} className="h-12 w-12 rounded-md object-cover" />
              <div>
                <p className="font-black text-ink">{product.seller.name}</p>
                <p className="text-sm text-slate-500">{product.seller.location}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <RatingStars value={product.seller.ratingAverage} />
                  <span>{product.seller.ratingAverage || 0} from {product.seller.ratingCount || 0} reviews</span>
                </div>
              </div>
            </div>
            {product.seller.bio && <p className="mt-3 text-sm text-slate-600">{product.seller.bio}</p>}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={buyNow} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-white hover:bg-slate-800">
              <ShoppingCart size={18} /> Buy now
            </button>
            <Link to={`/chat/${product.seller._id}`} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 hover:bg-slate-100">
              <MessageSquare size={18} /> Chat seller
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-black text-ink">Seller reviews</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-ink">{review.title}</p>
                  <p className="text-sm text-slate-500">By {review.buyer?.name} for {review.product?.title}</p>
                </div>
                <RatingStars value={review.rating} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

