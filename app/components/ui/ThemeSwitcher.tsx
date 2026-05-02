'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '../context/ThemeProvider'
import { useTranslation } from '../context/LanguageProvider'

export default function ThemeSwitcher() {
 const { theme, setTheme } = useTheme()
 const t = useTranslation()

 const options: { id: Theme; icon: any; label: string }[] = [
 { id: 'light', icon: Sun, label: t.theme.light },
 { id: 'dark', icon: Moon, label: t.theme.dark },
 { id: 'system', icon: Monitor, label: t.theme.system },
 ]

 return (
 <div className="px-5 py-3">
 <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
 {t.theme.title}
 </p>
 <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
 {options.map((opt) => {
 const Icon = opt.icon
 const isActive = theme === opt.id
 return (
 <button
 key={opt.id}
 onClick={() => setTheme(opt.id)}
 className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
 isActive
 ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
 }`}
 title={opt.label}
 type="button"
 >
 <Icon size={14} />
 <span>{opt.label}</span>
 </button>
 )
 })}
 </div>
 </div>
 )
}
