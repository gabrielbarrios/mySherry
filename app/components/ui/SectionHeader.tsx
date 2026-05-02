// @/components/ui/PageHeader.tsx
import ButtonBack from './ButtonBack';
import ButtonAction from './ButtonAction';
import Heading from './Heading';
import RatingComponent from '../database/RatingComponent';

// Definimos los estilos posibles para el botón
type ButtonVariant = 'create' | 'delete' | 'edit' | 'default';

// Definimos la estructura del objeto de rating
interface RatingConfig {
 itemId: string;
 tableName: string;
 userId?: string;
 initialRating?: number;
 initialReview?: string;
}

interface PageHeaderProps {
 title: string;
 description?: string; // Ahora es opcional
 buttonText?: string; // Opcional: si no viene, no hay botón
 buttonHref?: string; // Opcional
 variant?: ButtonVariant; // Estilo del botón
 back?: boolean;
 // Ahora usamos un solo objeto opcional
 ratingConfig?: RatingConfig;
}

export default function PageHeader({
 title,
 description,
 buttonText,
 buttonHref,
 variant = 'create',
 back,
 ratingConfig
}: PageHeaderProps) {

 return (
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">

 <div>
 {back && (
 <ButtonBack />
 )}
 <Heading level="h1">
 {title}
 </Heading>
 {description && (
 <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg italic">
 {description}
 </p>
 )}
 </div>

 {/* Solo renderizamos el Link si existen ambos: texto y href */}
 {buttonText && buttonHref && (
 <ButtonAction href={buttonHref} variant={variant}>
 {buttonText}
 </ButtonAction>
 )}
 {/* Si ratingConfig existe, renderizamos el componente */}
 {ratingConfig && (
 <div className="flex items-center">
 <RatingComponent
 itemId={ratingConfig.itemId}
 tableName={ratingConfig.tableName}
 userId={ratingConfig.userId}
 initialRating={ratingConfig.initialRating || 0}
 initialReview={ratingConfig.initialReview || ""}
 />
 </div>
 )}
 </div>
 );
}