import AdminGuard from '@/components/AdminGuard';

export default function WorkspacesLayout({ children }) {
    return <AdminGuard>{children}</AdminGuard>;
}
