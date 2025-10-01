// Minimal server-rendered 404 page without client/runtime dependencies
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 8 }}>404</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Page Not Found</div>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or the URL is incorrect.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 6, fontWeight: 600 }}>Go Home</Link>
          <Link href="/" style={{ textDecoration: 'none', padding: '8px 16px', border: '1px solid #2563eb', color: '#2563eb', borderRadius: 6, fontWeight: 600 }}>Go Back</Link>
        </div>
      </div>
    </div>
  );
}
