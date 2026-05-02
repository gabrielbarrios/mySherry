// @/components/ui/Heading.tsx

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface HeadingProps {
 level?: HeadingLevel;
 children: React.ReactNode;
 className?: string;
}

export default function Heading({
 level = 'h1',
 children,
 className = ""
}: HeadingProps) {

 // Mapeo de estilos según el nivel (Sin color fijo aquí)
 const styles: Record<HeadingLevel, string> = {
 h1: "text-5xl font-black tracking-tight leading-tight capitalize",
 h2: "text-2xl font-bold",
 h3: "font-bold text-lg"
 };

 // Lógica de prioridad: 
 // Si className ya trae un color (ej: text-gray-400), no ponemos el color por defecto.
 const hasColorDefined = className.includes('text-');
 const defaultColor = hasColorDefined ? "" : "text-gray-900 dark:text-gray-100";

 const commonStyles = `
 ${defaultColor}
 ${styles[level]}
 ${className} 
 `.trim(); // trim() quita espacios innecesarios al inicio/final

 const Tag = level;

 return (
 <Tag className={commonStyles}>
 {children}
 </Tag>
 );
}