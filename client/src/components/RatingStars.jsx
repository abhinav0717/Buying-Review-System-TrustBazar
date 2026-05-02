import { Star } from "lucide-react";

export default function RatingStars({ value = 0, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(value) ? "fill-amber text-amber" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

