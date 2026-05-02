// /library/language/translate.ts
import { esp } from './esp';
//import { eng } from './eng';

const dictionaries = {
    esp: esp,
    //    eng: eng,
};

export type LanguageCode = keyof typeof dictionaries;

export const getTranslation = (lang: string = 'esp') => {
    // Si el idioma no existe en nuestro objeto, devolvemos español por defecto
    return dictionaries[lang as LanguageCode] || dictionaries.esp;
};