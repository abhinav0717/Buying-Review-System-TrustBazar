import { useState } from "react";
import { Send, Star } from "lucide-react";

export default function ReviewForm({ order, onSubmit }) {
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    wouldRecommend: true
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({ ...form, orderId: order._id });
    setSaving(false);
    setForm({ rating: 5, title: "", comment: "", wouldRecommend: true });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            type="button"
            key={rating}
            onClick={() => setForm((current) => ({ ...current, rating }))}
            className="focus-ring rounded-md p-1"
            aria-label={`${rating} star rating`}
          >
            <Star size={22} className={rating <= form.rating ? "fill-amber text-amber" : "text-slate-300"} />
          </button>
        ))}
      </div>
      <input
        value={form.title}
        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
        required
        placeholder="Review title"
        className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"
      />
      <textarea
        value={form.comment}
        onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
        required
        minLength={10}
        placeholder="Share what happened with delivery, quality, and seller communication."
        rows={3}
        className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.wouldRecommend}
          onChange={(event) => setForm((current) => ({ ...current, wouldRecommend: event.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-mint"
        />
        I would recommend this seller
      </label>
      <button disabled={saving} className="focus-ring inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
        <Send size={16} /> {saving ? "Posting..." : "Post review"}
      </button>
    </form>
  );
}

