'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const supabase = createClient()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage('Logging in...')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(`Error: ${error.message}`)
        } else {
            setMessage('Success! Redirecting...')
            // Redirigimos a la página principal donde están las recetas
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col gap-6 p-10 max-w-md mx-auto border rounded-xl shadow-sm mt-10">
            <h1 className="text-3xl font-bold text-center text-orange-600">Chef Login</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        placeholder="chef@example.com"
                        className="border p-2 rounded-md text-black"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="border p-2 rounded-md text-black"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-md transition-colors"
                >
                    Sign In
                </button>
            </form>

            {message && (
                <p className={`text-center text-sm p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </p>
            )}

            <p className="text-center text-sm text-gray-600">
                Don't have an account? <a href="/signup" className="text-orange-500 underline">Register here</a>
            </p>
        </div>
    )
}