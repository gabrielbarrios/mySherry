// @/components/ui/ButtonAction.tsx
import Link from 'next/link';

type ButtonVariant = 'create' | 'delete' | 'edit' | 'default' | 'outline';

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: ButtonVariant;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export default function ButtonAction({
    children,
    href,
    onClick,
    variant = 'default',
    className = "",
    type = "button",
    disabled = false // <-- Valor por defecto
}: ButtonProps) {

    const variantStyles: Record<ButtonVariant, string> = {
        create: "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
        edit: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
        delete: "bg-red-600 hover:bg-red-700 shadow-red-100",
        default: "bg-gray-800 hover:bg-gray-900 shadow-gray-100",
        outline: "border-2 border-gray-200 text-gray-600 hover:bg-gray-50 shadow-none"
    };

    const commonStyles = `
        inline-flex items-center justify-center
        px-8 py-4 rounded-2xl font-black 
        transition-all active:scale-95 shadow-lg 
        uppercase text-sm tracking-widest whitespace-nowrap
        disabled:bg-gray-400 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed
        ${variant !== 'outline' ? 'text-white' : ''}
        ${variantStyles[variant]}
        ${className}
    `.trim();

    if (href) {
        return (
            <Link href={href} className={commonStyles}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={commonStyles}
            disabled={disabled} // <-- Aplicamos el atributo nativo
        >
            {children}
        </button>
    );
}