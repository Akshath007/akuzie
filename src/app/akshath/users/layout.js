import AdminGuard from '@/components/AdminGuard';

export default function UsersLayout({ children }) {
    return <AdminGuard>{children}</AdminGuard>;
}
