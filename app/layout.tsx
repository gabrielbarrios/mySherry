// app/layout.tsx
import { createClient } from '@/utils/supabase/server';
import { esp } from '@/library/language/esp';
import { eng } from '@/library/language/eng';
import { LanguageProvider } from '@/app/components/context/LanguageProvider';
import { getProfile } from '@/library/get-user-data';
import { ToastProvider } from './components/ui/Toast';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  // getProfile() uses React cache() — subsequent calls in any page are free
  const profileData = await getProfile();

  const langCode = profileData?.languaje || 'esp';
  const t = langCode === 'en' ? eng : esp;

  return (
    <html lang={langCode}>
      <body className="flex flex-col min-h-screen bg-gray-50 antialiased">
        {/* 3. Envolvemos todo con el Provider */}
        <LanguageProvider messages={t}>
          <ToastProvider>
            <Navbar authUser={authUser} username={profileData?.username} />
            <main className="grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}