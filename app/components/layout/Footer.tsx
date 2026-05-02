import Link from 'next/link';
import Image from 'next/image';
import { Globe, MessageCircle, Camera, Mail, Heart } from 'lucide-react';
import mysherryLogo from '@/app/assets/images/logos/mysherry.svg';

export default function Footer() {
 const currentYear = new Date().getFullYear();

 return (
 <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
 <div className="max-w-7xl mx-auto px-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

 {/* COLUMNA 1: LOGO Y SLOGAN */}
 <div className="col-span-1 md:col-span-1">
 <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105">
 <Image
 src={mysherryLogo}
 alt="MySherry Logo"
 width={130}
 height={32}
 className="h-8 w-auto"
 />
 </Link>
 <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
 Tu parte de la cereza. Comparte tus recetas favoritas y descubre los mejores lugares para comer en comunidad.
 </p>
 <div className="flex gap-4">
 {/* Representa Instagram */}
 <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors" title="Instagram">
 <Camera size={20} />
 </a>

 {/* Representa Twitter/X o Comunidad */}
 <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors" title="Twitter">
 <MessageCircle size={20} />
 </a>

 {/* Representa Github o Web */}
 <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors" title="Github">
 <Globe size={20} />
 </a>
 </div>
 </div>

 {/* COLUMNA 2: EXPLORAR */}
 <div>
 <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6">Explorar</h4>
 <ul className="space-y-4 text-sm">
 <li><Link href="/recipes" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Recetas populares</Link></li>
 <li><Link href="/restaurants" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Restaurantes</Link></li>
 <li><Link href="/trending" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Tendencias</Link></li>
 </ul>
 </div>

 {/* COLUMNA 3: SOPORTE */}
 <div>
 <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6">Comunidad</h4>
 <ul className="space-y-4 text-sm">
 <li><Link href="/about" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Sobre MySherry</Link></li>
 <li><Link href="/guidelines" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Normas de la casa</Link></li>
 <li><Link href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors">Contacto</Link></li>
 </ul>
 </div>

 {/* COLUMNA 4: NEWSLETTER / ACCIÓN */}
 <div>
 <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-6">Únete</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Recibe las mejores recetas en tu correo.</p>
 <div className="flex gap-2">
 <input
 type="email"
 placeholder="Tu email"
 className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-orange-500 transition-all"
 />
 <button className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
 <Mail size={18} />
 </button>
 </div>
 </div>
 </div>

 {/* BARRA INFERIOR DE COPYRIGHT */}
 <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
 <p className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
 © {currentYear} MySherry. Todos los derechos reservados.
 </p>
 <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
 Hecho con <Heart size={12} className="text-red-500 fill-red-500" /> para amantes de la comida.
 </div>
 </div>
 </div>
 </footer>
 );
}