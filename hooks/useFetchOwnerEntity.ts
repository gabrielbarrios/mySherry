import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

import { useTranslation } from '@/app/components/context/LanguageProvider';

export function useFetchOwnerEntity<T>(
    tableName: string,
    id: string | string[] | undefined,
    redirectPath: string
) {
    const supabase = createClient()
    const router = useRouter()

    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [authUser, setAuthUser] = useState<any>(null)
    const hasFetched = useRef(false)
    const t = useTranslation();


    useEffect(() => {
        if (hasFetched.current || !id) return

        async function loadData() {
            try {
                setLoading(true)

                // 1. Validar Usuario
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setAuthUser(user)

                // 2. Fetch de datos con doble candado
                const { data: entity, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single()

                if (error || !entity) throw new Error(t.global.notPermitions)

                setData(entity)
                hasFetched.current = true

            } catch (err) {
                console.error(err)
                router.push(redirectPath)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [id, tableName, redirectPath, router, supabase])

    return { data, loading, authUser, supabase }
}