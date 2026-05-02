// @/components/ui/Label.tsx

interface Props {
    children: React.ReactNode;
    className?: string;
    htmlFor: string;
}

export default function Label({
    children,
    className = "",
    htmlFor
}: Props) {
    return (
        <label htmlFor={htmlFor} className={`text-[10px] font-black ml-1 text-gray-400 uppercase tracking-widest ${className}`}>
            {children}
        </label>
    );
}