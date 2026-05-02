"use client";

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
 itemId: string;
 tableName: string;
 size?: number;
}

import { useTranslation } from '@/app/components/context/LanguageProvider';

export default function RatingDisplay({ itemId, tableName, size = 20 }: RatingDisplayProps) {
 const [average, setAverage] = useState<number>(0);
 const [totalVotes, setTotalVotes] = useState<number>(0);
 const [loading, setLoading] = useState(true);

 const supabase = useMemo(() => createClient(), []);

 const t = useTranslation();

 useEffect(() => {
 const fetchAverage = async () => {
 setLoading(true);
 try {
 const { data, error } = await supabase
 .from(tableName)
 .select('rating')
 .eq('item_id', itemId);

 if (!error && data && data.length > 0) {
 const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
 const avg = sum / data.length;
 // Redondeamos al número entero más cercano para iluminar las estrellas
 setAverage(Math.round(avg));
 setTotalVotes(data.length);
 } else {
 // Si no hay datos, reseteamos para evitar mostrar promedios viejos
 setAverage(0);
 setTotalVotes(0);
 }
 } catch (err) {
 console.error("Error fetching rating:", err);
 } finally {
 setLoading(false);
 }
 };

 if (itemId) fetchAverage();
 }, [itemId, tableName, supabase]);

 if (loading) return <div className="animate-pulse h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>;

 return (
 <div className="inline-flex items-center gap-1.5 ">
 <div className="flex">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 size={size}
 // Lógica: si el número de estrella es menor o igual al promedio, se pinta
 className={`${star <= average
 ? 'text-orange-500 fill-orange-500'
 : 'text-gray-200 fill-gray-200'
 } transition-colors`}
 />
 ))}
 </div>
 {totalVotes > 0 ? (
 <span className="text-xs font-black text-gray-500 dark:text-gray-400 ml-0.5">
 {totalVotes}
 </span>
 ) : (
 <span className="text-[9px] text-gray-300 uppercase font-black tracking-tighter">
 {t.global.noVotes}
 </span>
 )}
 </div>
 );
}