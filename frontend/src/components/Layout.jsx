import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag, Github, Globe, Server, Layers } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Background gradients */}
      <div className="gradient-bg"></div>

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <span className="brand-icon">📦</span>
          <span className="brand-name">Management Dashboard</span>
        </div>

        <nav style={{ marginBottom: '1.5rem' }}>
          <ul className="nav-links">
            {menuItems.map((item) => {
              const isActive = 
                item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

              return (
                <li 
                  key={item.name} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Project Submission Links */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '1.25rem', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ color: 'var(--text-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
            Submission Links
          </div>
          
          <a 
            href="https://github.com/kirtirohi10/inventoryordersystem.git" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Github size={14} />
            <span>GitHub Repository</span>
          </a>

          <a 
            href="https://inventoryordersystem.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Globe size={14} />
            <span>Frontend App</span>
          </a>

          <a 
            href="https://inventorybackend-is6v.onrender.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Server size={14} />
            <span>Backend API</span>
          </a>

          <a 
            href="https://hub.docker.com/r/kirtirohi10/inventory-backend" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Layers size={14} />
            <span>Docker Hub Image</span>
          </a>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-window">
        {children}
      </main>
    </div>
  );
};

export default Layout;
