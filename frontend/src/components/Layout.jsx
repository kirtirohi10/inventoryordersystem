import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag } from 'lucide-react';

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

        <nav>
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
      </aside>

      {/* Main Content Pane */}
      <main className="main-window">
        {children}
      </main>
    </div>
  );
};

export default Layout;
