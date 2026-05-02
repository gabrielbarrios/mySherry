/**
 * Genera una cadena alfanumérica aleatoria de la longitud deseada
 * @param length - Cantidad de caracteres (por defecto 4)
 */
export const generateRandomString = (length: number = 4): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

/**
 * Genera un slug amigable para URL a partir de un nombre
 */
export const generateSlug = (name: string): string => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quita acentos
        .replace(/\s+/g, '-')           // Espacios por guiones
        .replace(/[^\w-]+/g, '');        // Quita caracteres especiales

    // Reutilizamos la función de arriba
    return `${baseSlug}-${generateRandomString(4)}`;
};

/**
 * Ejemplo de otra función reusable: Formatear moneda
 */
export const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
}