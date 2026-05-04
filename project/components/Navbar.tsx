'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/propiedades', label: 'Propiedades' },
    { href: '/publicar', label: 'Publicar gratis' },
  ];

  const bgStyle = isHome && !scrolled
    ? { background: 'transparent' }
    : { background: 'rgba(255,255,255,0.95)', boxShadow: '0 1px 0 rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' };

  const textColor = isHome && !scrolled ? 'text-white' : 'text-gray-800';
  const logoColor = isHome && !scrolled ? '#ffffff' : '#2563eb';

  return (
    <nav
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.3s ease', ...bgStyle }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: logoColor, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: logoColor, letterSpacing: '-0.5px', transition: 'color 0.3s' }}>
            Merofise
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                color: pathname === link.href
                  ? '#2563eb'
                  : (isHome && !scrolled ? 'rgba(255,255,255,0.85)' : '#4b5563'),
                background: pathname === link.href ? 'rgba(37,99,235,0.1)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+34664037407"
            style={{
              marginLeft: 8,
              padding: '8px 16px',
              background: '#2563eb',
              color: 'white',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            664 037 407
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}
          className="md:hidden block"
          aria-label="Menú"
        >
          <div style={{ width: 24, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'block', height: 2, background: isHome && !scrolled ? 'white' : '#374151', borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ display: 'block', height: 2, background: isHome && !scrolled ? 'white' : '#374151', borderRadius: 2, transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', height: 2, background: isHome && !scrolled ? 'white' : '#374151', borderRadius: 2, transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }} className="md:hidden">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                color: pathname === link.href ? '#2563eb' : '#374151',
                background: pathname === link.href ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+34664037407"
            style={{
              marginTop: 8,
              padding: '12px 16px',
              background: '#2563eb',
              color: 'white',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Llamar: 664 037 407
          </a>
        </div>
      )}
    </nav>
  );
}
