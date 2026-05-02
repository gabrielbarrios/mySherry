// components/ui/StaticRating.tsx
import { Star } from 'lucide-react';

export default function StaticRating({ rating, total, size = 16 }: { rating: number, total: number, size?: number }) {
 return (
 <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
 <div className="flex">
 {[1, 2, 3, 4, 5].map((s) => (
 <Star
 key={s}
 size={size}
 className={`${s <= rating ? 'text-orange-500 fill-orange-500' : 'text-gray-200 fill-gray-200'}`}
 />
 ))}
 </div>
 {total > 0 && <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">({total})</span>}
 </div>
 );
}