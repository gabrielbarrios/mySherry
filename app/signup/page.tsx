'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false) // Estado para el botón
    const [message, setMessage] = useState('')

    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('') // Limpiamos mensajes previos

        try {
            // 1. VERIFICACIÓN: Consultar si el username ya existe
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .maybeSingle() // Usamos maybeSingle para que no lance error si no encuentra nada

            if (checkError) throw checkError

            if (existingUser) {
                setMessage('Error: This username is already taken. Please try another one.')
                setLoading(false)
                return // Detenemos el proceso aquí
            }

            // 2. REGISTRO: Si el nombre está libre, procedemos con el Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) throw signUpError


            // 3. VALIDACIÓN DE "USUARIO FANTASMA"
            // Si Supabase devuelve un usuario pero la lista de identidades está vacía, 
            // significa que el correo ya existía (con la protección activada).
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                setMessage('Error: This email is already registered. Try logging in.')
                setLoading(false)
                return
            }



            setMessage('Success! Please check your email to verify your account.')

        } catch (err: any) {
            setMessage(`Error: ${err.message || 'An unexpected error occurred'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-10 max-w-md mx-auto border rounded-xl shadow-sm mt-10 bg-white">
            <h1 className="text-3xl font-bold text-center text-orange-600">Chef Registration</h1>

            <form onSubmit={handleSignUp} className="flex flex-col gap-4 text-black">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        placeholder="ChefMaster2000"
                        className="border p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        placeholder="chef@example.com"
                        className="border p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="border p-2 rounded-md outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-md transition-colors disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Create Account'}
                </button>
            </form>

            {message && (
                <div className={`text-center text-sm p-3 rounded-lg border ${message.includes('Error')
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    )
}