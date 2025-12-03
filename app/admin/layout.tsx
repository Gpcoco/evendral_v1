import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex gap-6">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <Link href="/admin/items" className="text-muted-foreground hover:text-foreground">Items</Link>
          <Link href="/admin/episodes" className="text-muted-foreground hover:text-foreground">Episodes</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}