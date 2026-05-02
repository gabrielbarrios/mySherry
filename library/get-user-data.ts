import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

// 'cache' hace que si se llama 10 veces en una misma petición, 
// solo se ejecute realmente 1 vez contra la base de datos.
export const getProfile = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('profiles')
        .select('username, languaje, interests')
        .eq('id', user.id)
        .single();

    return data;
})