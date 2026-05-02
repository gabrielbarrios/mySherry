// @/components/layout/Navbar.tsx
import HeaderClient from './HeaderClient';

export default function Navbar({ authUser, username }: { authUser: any, username: string | null }) {
    // Ya no necesitas 'createClient' aquí porque los datos vienen del layout
    return (
        <HeaderClient
            authUser={authUser}
            username={username}
        />
    );
}