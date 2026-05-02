import { Filter, Search, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../services/api.js";
import { selectAuth } from "../store/authSlice.js";

const categories = ["all", "Handmade", "Home", "Tech", "Accessories"];

export default function Home() {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const query = useMemo(() => ({ page, limit: 6, category, search }), [page, category, search]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      const { data } = await api.get("/products", { params: query });
      if (!ignore) {
        setProducts((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setPages(data.pages || 1);
        setLoading(false);
      }
    }

    loadProducts().catch(() => {
      if (!ignore) setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [query, page]);

  function resetFilters(next) {
    setPage(1);
    next();
  }

  async function handleBuy(productId) {
    if (!token) {
      navigate("/login", { state: { from: "/" } });
      return;
    }

    try {
      await api.post("/orders", { productId });
      setNotice("Purchase completed. You can now review this seller from Orders.");
      setTimeout(() => navigate("/orders"), 900);
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to create order");
    }
  }

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-12">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md bg-mint/10 px-3 py-2 text-sm font-bold text-teal-800">
              <ShieldCheck size={16} /> Verified purchase reviews
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-ink sm:text-5xl">
              Marketplace trust built from real orders.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Buyers can review sellers only after purchase completion, so seller ratings are connected to real transactions, not random public comments.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric icon={<Star size={18} />} label="Review integrity" value="Order linked" />
              <Metric icon={<TrendingUp size={18} />} label="Seller score" value="Auto updated" />
              <Metric icon={<ShieldCheck size={18} />} label="Trust layer" value="JWT secured" />
            </div>
          </div>
          <div className="min-h-80 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
              alt="Buyer checking a marketplace order"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">Products</h2>
            <p className="text-sm text-slate-600">Browse sellers, purchase items, then rate only completed orders.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => resetFilters(() => setSearch(event.target.value))}
                placeholder="Search products"
                className="focus-ring h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 sm:w-72"
              />
            </label>
            <label className="relative block">
              <Filter size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={category}
                onChange={(event) => resetFilters(() => setCategory(event.target.value))}
                className="focus-ring h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-8 sm:w-48"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {notice && <div className="mb-5 rounded-md border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-semibold text-teal-900">{notice}</div>}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onBuy={handleBuy} />
          ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            No products match this search.
          </div>
        )}

        {page < pages && (
          <div className="mt-8 text-center">
            <button onClick={() => setPage((current) => current + 1)} className="focus-ring rounded-md border border-slate-300 bg-white px-5 py-2 font-bold text-ink hover:bg-slate-100">
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-mint shadow-sm">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-black text-ink">{value}</p>
    </div>
  );
}

