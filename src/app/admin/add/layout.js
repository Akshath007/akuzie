import AdminGuard from '@/components/AdminGuard';

export default function Layout({ children }) {
    return <AdminGuard>{children}</AdminGuard>;
}
