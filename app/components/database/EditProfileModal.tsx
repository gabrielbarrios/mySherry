// @/components/profile/EditProfileModal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { X, Hash, FileText } from 'lucide-react';
import FormInput from '../form/FormInput';
import ImageUpload from '../ui/ImageUpload';
import ButtonAction from '../ui/ButtonAction';
import { useTranslation } from '../context/LanguageProvider';

const INTEREST_OPTIONS = [
 { id: 'recipes', label: 'Recetas' },
 { id: 'restaurants', label: 'Restaurantes' },
 { id: 'medicals', label: 'Médico' },
 { id: 'events', label: 'Eventos' },
 { id: 'albums', label: 'Álbumes' },
];

export default function EditProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
 const supabase = useMemo(() => createClient(), []);
 const router = useRouter();
 const t = useTranslation();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState({
 username: '',
 biography: '',
 avatar_url: '',
 interests: [] as string[]
 });

 useEffect(() => {
 if (!isOpen) return;
 async function loadProfile() {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
 if (data) {
 setFormData({
 username: data.username || '',
 biography: data.biography || '',
 avatar_url: data.avatar_url || '',
 interests: data.interests || []
 });
 }
 setLoading(false);
 }
 loadProfile();
 }, [isOpen, supabase]); // supabase is stable via useMemo

 const handleInterestChange = (interestId: string) => {
 setFormData(prev => {
 const current = prev.interests || [];
 return {
 ...prev,
 interests: current.includes(interestId)
 ? current.filter(id => id !== interestId)
 : [...current, interestId]
 };
 });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 const { data: { user } } = await supabase.auth.getUser();

 const { biography, avatar_url, interests } = formData;

 const { error } = await supabase.from('profiles').update({
 biography,
 avatar_url,
 interests
 }).eq('id', user?.id);

 if (!error) {
 router.refresh();
 onClose();
 }
 setSaving(false);
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
 {/* Overlay */}
 <div className="absolute inset-0 bg-black/40 dark:bg-gray-950/40 backdrop-blur-sm" onClick={onClose}></div>

 {/* Modal */}
 <div className="relative bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
 <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
 <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Editar Perfil</h2>
 <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
 <FormInput
 label="Username (No editable)"
 name="username (No editable)"
 id="username"
 icon={Hash}
 value={formData.username}
 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
 readOnly
 className='opacity-40'
 />
 <FormInput
 label="Biografía"
 name="biography"
 id="biography"
 type="textarea"
 icon={FileText}
 value={formData.biography}
 onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
 />
 <ImageUpload
 label={t.form.imageProfile}
 value={formData.avatar_url}
 onChange={(url) => setFormData({ ...formData, avatar_url: url })}
 folder="avatars"
 aspectRatio="1/1"
 />

 <div>
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">Intereses</p>
 <div className="flex flex-wrap gap-2">
 {INTEREST_OPTIONS.map(opt => {
 const isSelected = formData.interests.includes(opt.id);
 return (
 <button
 key={opt.id}
 type="button"
 onClick={() => handleInterestChange(opt.id)}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:border-gray-700'}`}
 >
 {opt.label}
 </button>
 )
 })}
 </div>
 </div>

 <ButtonAction type="submit" variant="create" className="w-full py-4" disabled={saving}>
 {saving ? 'Guardando...' : 'Guardar Cambios'}
 </ButtonAction>
 </form>
 </div>
 </div>
 );
}