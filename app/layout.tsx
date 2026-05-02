// app/layout.tsx
import { createClient } from '@/utils/supabase/server';
import { esp } from '@/library/language/esp';
import { eng } from '@/library/language/eng';
import { LanguageProvider } from '@/app/components/context/LanguageProvider';
import { ThemeProvider, themeNoFlashScript } from '@/app/components/context/ThemeProvider';
import { getProfile } from '@/library/get-user-data';
import { ToastProvider } from './components/ui/Toast';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
 const supabase = await createClient();

 const { data: { user: authUser } } = await supabase.auth.getUser();
 const profileData = await getProfile();

 const langCode = profileData?.languaje || 'esp';
 const t = langCode === 'en' ? eng : esp;

 return (
 <html lang={langCode} suppressHydrationWarning>
 <head>
 <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
 </head>
 <body className="flex flex-col min-h-screen antialiased">
 <ThemeProvider>
 <LanguageProvider messages={t}>
 <ToastProvider>
 <Navbar authUser={authUser} username={profileData?.username} />
 <main className="grow">
 {children}
 </main>
 <Footer />
 </ToastProvider>
 </LanguageProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
