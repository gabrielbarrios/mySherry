// @/components/form/FormInput.tsx
import { LucideIcon } from 'lucide-react';
import Label from './Label';
import { Required } from './Required';

interface Props {
 id: string;
 name: string;
 type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'tel' | 'url';
 placeholder?: string;
 value?: any;
 defaultValue?: any;
 onChange?: (e: any) => void;
 required?: boolean;
 rows?: number;
 options?: { value: string | number; label: string }[];
 className?: string;
 icon?: LucideIcon;
 step?: string | number;
 min?: string | number;
 max?: string | number;
 readOnly?: boolean;
 label?: string;
}

export default function FormInput({
 id,
 name,
 type = 'text',
 placeholder,
 value,
 defaultValue,
 onChange,
 required = false,
 rows = 4,
 options = [],
 className = "",
 icon: Icon,
 step,
 min,
 max,
 readOnly = false,
 label
}: Props) {

 // Estilos base
 const baseStyles = `
 w-full h-[54px] border border-gray-200 dark:border-gray-700 rounded-xl
 focus:ring-2 focus:ring-orange-500 outline-none transition-all
 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
 bg-gray-50 dark:bg-gray-800 disabled:opacity-50
 ${Icon ? 'pr-12 pl-4' : 'px-4'}
 ${className}
 `.trim();

 /**
 * LÓGICA CRÍTICA: 
 * Si 'value' existe (no es undefined), el componente es CONTROLADO.
 * Si no, usamos 'defaultValue' para que sea NO CONTROLADO.
 * Nunca pasamos ambos al mismo tiempo.
 */
 const inputProps: any = {
 id,
 name,
 placeholder,
 required,
 // Si hay value, forzamos un string vacío si llega nulo para evitar el error de controlled/uncontrolled
 ...(value !== undefined ? { value: value ?? "" } : { defaultValue: defaultValue ?? "" }),
 onChange: onChange,
 // Si es controlado (hay value) pero no hay onChange, lo ponemos como readOnly automáticamente
 readOnly: readOnly || (value !== undefined && !onChange),
 };

 // --- RENDERIZADO DE TEXTAREA ---
 if (type === 'textarea') {
 return (
 <div className="relative w-full gap-2 flex flex-col">
 {label && (
 <Label htmlFor={id}>{label}</Label>
 )}
 <textarea
 {...inputProps}
 rows={rows}
 className={`${baseStyles} h-auto py-3`}
 />
 </div>
 );
 }

 // --- RENDERIZADO DE SELECT ---
 if (type === 'select') {
 return (
 <div className="relative w-full gap-2 flex flex-col">
 {label && (
 <Label htmlFor={id}>{label} {required && <Required />}</Label>
 )}
 <select
 {...inputProps}
 // En select usamos disabled en lugar de readOnly
 disabled={inputProps.readOnly}
 className={`${baseStyles} cursor-pointer`}
 >
 {options.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 </option>
 ))}
 </select>
 </div>
 );
 }

 // --- RENDERIZADO DE INPUT NORMAL ---
 return (
 <div className="relative w-full gap-2 flex flex-col">
 {label && (
 <Label htmlFor={id}>{label}{required && <Required />}</Label>
 )}
 <div className="relative flex items-center">
 {Icon && (
 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 flex items-center justify-center">
 <Icon size={20} />
 </div>
 )}
 <input
 {...inputProps}
 type={type}
 step={step}
 min={min}
 max={max}
 className={baseStyles}
 />
 </div>
 </div>
 );
}