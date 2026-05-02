// app/page.tsx
import Heading from '@/app/components/ui/Heading';
import UserSearch from './components/database/UserSearch';
import InterestsCard from './components/ui/InterestsCard';

// 1. IMPORTANTE: Tienes que importar los diccionarios para que 't' sepa qué son


// 2. Importa tu función con caché
import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function HomePage() {
  // 3. Usamos la función optimizada que creamos
  // Esta ya trae: username, languaje e interests en una sola llamada
  const profile = await getProfile();

  // 4. Definimos el idioma basado en el perfil
  const t = getTranslation(profile?.languaje);

  // 5. Obtenemos los intereses del perfil que ya descargamos
  const interests = profile?.interests || [];
  const displayInterests = interests.length > 0 ? interests : ['recipe', 'restaurant'];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <section className="mb-12">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          {/* Ahora t funcionará correctamente */}
          {t.home.top}
        </p>

        <Heading level="h1" className="mb-8">
          {t.home.title}
        </Heading>

        <UserSearch className='pb-4' />

        <Heading level="h2" className='pb-4'>
          {/* Puedes agregar 'interests' a tu diccionario para traducir esto también */}
          {t.home.interest}
        </Heading>

        <InterestsCard displayInterests={displayInterests} />
      </section>
    </main>
  );
}