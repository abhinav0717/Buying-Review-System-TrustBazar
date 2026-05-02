import { MessageSquare, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Protected from "../components/Protected.jsx";
import RatingStars from "../components/RatingStars.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import { api } from "../services/api.js";

export default function Orders() {
  return (
    <Protected>
      <OrdersContent />
    </Protected>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    const { data } = await api.get("/orders/my");
    setOrders(data);
  }

  useEffect(() => {
    loadOrders().catch(() => setMessage("Unable to load orders"));
  }, []);

  async function submitReview(payload) {
    try {
      await api.post("/reviews", payload);
      setMessage("Review posted and seller rating updated.");
      await loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to post review");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-mint text-white">
          <PackageCheck size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-ink">My Orders</h1>
          <p className="text-sm text-slate-600">Only completed purchases can be reviewed.</p>
        </div>
      </div>

      {message && <div className="mb-5 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink">{message}</div>}

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[128px_1fr]">
              <img src={order.product?.imageUrl} alt={order.product?.title} className="h-32 w-full rounded-md object-cover" loading="lazy" />
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-clay">{order.status}</p>
                    <h2 className="mt-1 text-xl font-black text-ink">{order.product?.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">Sold by {order.seller?.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <RatingStars value={order.seller?.ratingAverage || 0} />
                      <span>{order.seller?.ratingCount || 0} reviews</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-ink">₹{order.totalAmount}</p>
                    <Link to={`/chat/${order.seller?._id}`} className="focus-ring mt-2 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
                      <MessageSquare size={16} /> Chat
                    </Link>
                  </div>
                </div>
                {order.reviewed ? (
                  <div className="mt-4 rounded-md bg-mint/10 px-3 py-2 text-sm font-semibold text-teal-900">
                    Review already submitted for this order.
                  </div>
                ) : (
                  <ReviewForm order={order} onSubmit={submitReview} />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold text-ink">No orders yet</p>
          <p className="mt-1 text-sm text-slate-600">Buy a product from the marketplace to unlock seller review posting.</p>
        </div>
      )}
    </section>
  );
}

