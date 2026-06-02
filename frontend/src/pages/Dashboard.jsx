import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { InventoryAPI, OrderAPI, CustomerAPI } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Parallel requests for optimal load speed
        const [invData, ordersData, customersData] = await Promise.all([
          InventoryAPI.getSummary(),
          OrderAPI.getAll(),
          CustomerAPI.getAll()
        ]);
        
        setMetrics(invData.metrics);
        setLowStockItems(invData.low_stock_items || []);
        setCustomerCount(customersData.length);
        
        // Show only the 5 most recent orders
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err) {
        setError(err.message || 'Failed to retrieve dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader message="Compiling inventory statistics..." />;

  const statCards = [
    {
      title: 'Total Valuation',
      value: `$${parseFloat(metrics?.total_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign size={24} />,
      class: 'primary',
      desc: 'Total value of stock in warehouse'
    },
    {
      title: 'Total Products',
      value: metrics?.total_products || 0,
      icon: <Package size={24} />,
      class: 'secondary',
      desc: 'Different SKUs registered'
    },
    {
      title: 'Active Customers',
      value: customerCount,
      icon: <Users size={24} />,
      class: 'success',
      desc: 'Total clients registered'
    },
    {
      title: 'Total Orders',
      value: recentOrders.length >= 5 ? `${recentOrders.length}+` : recentOrders.length,
      icon: <ShoppingBag size={24} />,
      class: 'success',
      desc: 'Total orders placed'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.low_stock_count || 0,
      icon: <AlertTriangle size={24} />,
      class: 'warning',
      desc: 'Items under 10 stock units'
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Operations Dashboard</h1>
          <p>Real-time analytics and inventory health indicators</p>
        </div>
      </div>

      <Alert type="error" message={error} />

      {/* Grid Stat Cards */}
      <div className="dashboard-grid">
        {statCards.map((card, index) => (
          <div key={card.title} className={`glass-panel stat-card glass-card-interactive animate-fade-in delay-${index + 1}`}>
            <div className={`stat-icon-wrapper ${card.class}`}>
              {card.icon}
            </div>
            <div className="stat-details">
              <h3>{card.title}</h3>
              <p>{card.value}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Quick Links & Alert center */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Quick Actions Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/orders?new=true" className="btn btn-primary" style={{ justifyContent: 'center' }}>
              <PlusCircle size={18} />
              Create Order Request
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              <PlusCircle size={18} />
              Add Product SKU
            </Link>
            <Link to="/customers" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              <PlusCircle size={18} />
              Register Customer
            </Link>
          </div>
        </div>

        {/* Low Stock Warning Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--warning)" />
            Stock Alert List ({lowStockItems.length})
          </h2>
          {lowStockItems.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem 0' }}>
              All products are sufficiently stocked.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
              {lowStockItems.slice(0, 4).map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                  </div>
                  <span className="badge badge-warning">{item.stock_quantity} left</span>
                </div>
              ))}
              {lowStockItems.length > 4 && (
                <Link to="/products" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', alignSelf: 'flex-end', marginTop: '0.25rem' }}>
                  View all items <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent Orders Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={20} color="var(--secondary)" />
          Recent Orders
        </h2>
        {recentOrders.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No orders found. Click "Create Order Request" to place the first order.
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '0.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Items Ordered</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#ORD-{order.id}</td>
                    <td>{order.customer?.name}</td>
                    <td>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>{order.items?.length} items</td>
                    <td style={{ fontWeight: 600 }}>
                      ${parseFloat(order.total_price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
