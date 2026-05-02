"use client";

import { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Star, X } from 'lucide-react';
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';

interface RatingProps {
    itemId: string;          // El ID (Restaurante, Receta, etc.)
    tableName: string;       // La tabla (restaurant_reviews, recipe_reviews, etc.)
    userId: string | undefined;
    initialRating: number;
    initialReview: string;
}

/**
 * Example
   <RatingComponent
        itemId={restaurant.id}
        tableName="restaurant_reviews"
        userId={authUser?.id}
        initialRating={existingReview?.rating || 0}
        initialReview={existingReview?.personal_review || ""}
    />
 */

export default function RatingComponent({
    itemId,
    tableName,
    userId,
    initialRating,
    initialReview
}: RatingProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState(initialReview);
    const [loading, setLoading] = useState(false);

    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const t = useTranslation();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!userId) {
            toast.info(t.global.notLoggedIn);
            return;
        }
        setLoading(true);

        const { error } = await supabase
            .from(tableName)
            .upsert({
                item_id: itemId,
                user_id: userId,
                rating: rating,
                personal_review: review,
            }, {
                onConflict: 'user_id, item_id'
            });

        if (error) {
            toast.error(t.global.errorSave + ': ' + error.message);
        } else {
            setIsOpen(false);
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
                <Star className={initialRating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} size={18} />
                {initialRating > 0 ? 'Editar mi reseña' : 'Calificar'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">

                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-2">
                            {initialRating > 0 ? 'Actualizar reseña' : '¿Qué te pareció?'}
                        </h2>

                        <div className="flex gap-2 my-8 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    <Star
                                        size={40}
                                        className={`transition-colors ${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Comentarios</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Escribe tu reseña aquí..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-gray-700 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsOpen(false)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || rating === 0}
                                className={`flex-1 py-4 font-bold text-white rounded-2xl shadow-lg transition-all ${loading || rating === 0 ? 'bg-gray-300' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                    }`}
                            >
                                {loading ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}