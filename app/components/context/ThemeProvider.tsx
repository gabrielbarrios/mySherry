'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeCtx {
    theme: Theme
    resolved: 'light' | 'dark'
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

const STORAGE_KEY = 'mysherry-theme'

function applyTheme(theme: Theme): 'light' | 'dark' {
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
    return isDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system')
    const [resolved, setResolved] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
        setThemeState(stored)
        setResolved(applyTheme(stored))

        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => {
            const current = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
            if (current === 'system') setResolved(applyTheme('system'))
        }
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])

    const setTheme = (t: Theme) => {
        // Add transition class momentarily for smooth color change
        const root = document.documentElement
        root.classList.add('theme-transition')
        window.setTimeout(() => root.classList.remove('theme-transition'), 250)

        localStorage.setItem(STORAGE_KEY, t)
        setThemeState(t)
        setResolved(applyTheme(t))
    }

    return (
        <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}

// Inline script to set the theme class BEFORE paint (no flash on reload).
// Runs synchronously in <head> before React hydration.
export const themeNoFlashScript = `
(function() {
    try {
        var key = '${STORAGE_KEY}';
        var theme = localStorage.getItem(key) || 'system';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
        var root = document.documentElement;
        if (isDark) root.classList.add('dark');
        root.style.colorScheme = isDark ? 'dark' : 'light';
    } catch(e) {}
})();
`
