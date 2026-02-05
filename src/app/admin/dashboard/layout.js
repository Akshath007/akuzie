import AdminGuard from '@/components/AdminGuard';

export default function DashboardLayout({ children }) {
    return <AdminGuard>{children}</AdminGuard>;
}
