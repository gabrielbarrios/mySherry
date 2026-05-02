// @/components/context/LanguageProvider.tsx
'use client';
import { createContext, useContext } from 'react';

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children, messages }: { children: React.ReactNode, messages: any }) {
 return (
 <LanguageContext.Provider value={messages}>
 {children}
 </LanguageContext.Provider>
 );
}

export const useTranslation = () => useContext(LanguageContext);