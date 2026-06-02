import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, ShoppingBag, PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderAPI, CustomerAPI, ProductAPI } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });
  
  // Expanded Order IDs state for accordion list
  const [expandedOrders, setExpandedOrders] = useState({});

  // Search filter
  const [search, setSearch] = useState('');

  // Modal configuration
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]); // List of { product_id, quantity, name, sku, price, maxStock }
  
  // Current Item selection states
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        OrderAPI.getAll(),
        CustomerAPI.getAll(),
        ProductAPI.getAll()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to fetch order records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    
    // Check if redirecting from dashboard with ?new=true query param
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      setSearchParams({}); // Clear query parameter
    }
  }, [searchParams]);

  const triggerAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 8000);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleOpenModal = () => {
    setSelectedCustomerId('');
    setOrderItems([]);
    setCurrentProductId('');
    setCurrentQuantity(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Add item to draft order list
  const handleAddItem = () => {
    if (!currentProductId) {
      triggerAlert('error', 'Please select a product.');
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(currentProductId, 10));
    if (!selectedProduct) return;

    if (currentQuantity < 1) {
      triggerAlert('error', 'Quantity must be at least 1.');
      return;
    }

    // Live validation against available stock in UI list
    if (selectedProduct.stock_quantity < currentQuantity) {
      triggerAlert('error', `Insufficient stock for "${selectedProduct.name}". Only ${selectedProduct.stock_quantity} left.`);
      return;
    }

    // Check if product already exists in item draft list
    const existingIndex = orderItems.findIndex(item => item.product_id === selectedProduct.id);
    if (existingIndex > -1) {
      const updatedItems = [...orderItems];
      const newQty = updatedItems[existingIndex].quantity + currentQuantity;
      
      if (selectedProduct.stock_quantity < newQty) {
        triggerAlert('error', `Cumulative quantity exceeds available stock (${selectedProduct.stock_quantity}).`);
        return;
      }
      
      updatedItems[existingIndex].quantity = newQty;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          price: parseFloat(selectedProduct.price),
          quantity: currentQuantity,
          maxStock: selectedProduct.stock_quantity
        }
      ]);
    }

    // Reset current item selections
    setCurrentProductId('');
    setCurrentQuantity(1);
  };

  // Remove item from draft order list
  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Submit Order Creation
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      triggerAlert('error', 'Please select a customer.');
      return;
    }

    if (orderItems.length === 0) {
      triggerAlert('error', 'Please add at least one product to the order.');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload = {
        customer_id: parseInt(selectedCustomerId, 10),
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const result = await OrderAPI.create(payload);
      triggerAlert('success', `Order #ORD-${result.id} placed successfully!`);
      handleCloseModal();
      fetchInitialData();
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to place order.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Live filter orders by customer name or ID
  const filteredOrders = orders.filter(order => 
    order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    `ORD-${order.id}`.toLowerCase().includes(search.toLowerCase())
  );

  const getProductMaxStock = () => {
    if (!currentProductId) return 0;
    const selected = products.find(p => p.id === parseInt(currentProductId, 10));
    return selected ? selected.stock_quantity : 0;
  };

  const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Order Management</h1>
          <p>Create client sales orders and inspect historical transaction logs</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          Create Order Request
        </button>
      </div>

      <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo({ type: '', message: '' })} />

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by customer name or order number..." 
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching order records..." />
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No orders found. Click "Create Order Request" to start sales logs.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map(order => {
            const isExpanded = !!expandedOrders[order.id];
            return (
              <div 
                key={order.id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.25rem',
                  borderLeft: '4px solid var(--primary)',
                  cursor: 'pointer'
                }}
                onClick={() => toggleOrderExpand(order.id)}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Number</div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>#ORD-{order.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Name</div>
                      <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Date</div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
                      <div style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.15rem' }}>
                        ${parseFloat(order.total_price || 0).toFixed(2)}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Accordion Details */}
                {isExpanded && (
                  <div 
                    style={{ 
                      marginTop: '1.5rem', 
                      paddingTop: '1.25rem', 
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      animation: 'fadeIn 0.25s ease-out forwards'
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing accordion when clicking inside details
                  >
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                      Line Items Detailed Index
                    </h3>
                    
                    <div className="table-container" style={{ margin: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Item Details</th>
                            <th>Unit Price</th>
                            <th>Quantity</th>
                            <th style={{ textAlign: 'right' }}>Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map(item => (
                            <tr key={item.id}>
                              <td style={{ fontFamily: 'monospace', color: 'var(--secondary)' }}>{item.product?.sku}</td>
                              <td style={{ fontWeight: 600 }}>{item.product?.name}</td>
                              <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Order Wizard Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Order Request">
        <form onSubmit={handleFormSubmit}>
          {/* Customer Selector */}
          <div className="form-group">
            <label>Select Customer</label>
            <select 
              className="form-control"
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose registered customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Add Products
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '2 1 200px' }}>
                <label>Select Product</label>
                <select 
                  className="form-control"
                  value={currentProductId}
                  onChange={(e) => {
                    setCurrentProductId(e.target.value);
                    setCurrentQuantity(1); // Reset default quantity
                  }}
                >
                  <option value="">-- Choose item SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                      {p.name} (SKU: {p.sku}) {p.stock_quantity <= 0 ? '[OUT OF STOCK]' : `[Stock: ${p.stock_quantity}]`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 80px' }}>
                <label>
                  Quantity {currentProductId && (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}>
                      Max {getProductMaxStock()}
                    </span>
                  )}
                </label>
                <input 
                  type="number"
                  className="form-control"
                  min="1"
                  max={getProductMaxStock()}
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(parseInt(e.target.value, 10))}
                  disabled={!currentProductId}
                />
              </div>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ height: '43px', display: 'flex', alignItems: 'center', flex: '0 0 auto' }}
                onClick={handleAddItem}
                disabled={!currentProductId}
              >
                <PlusCircle size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Draft Itemized List */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Items List ({orderItems.length})
            </label>
            {orderItems.length === 0 ? (
              <div style={{ 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                textAlign: 'center', 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}>
                No items added to this draft yet. Select a product above.
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <table style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Item</th>
                      <th style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Qty</th>
                      <th style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Unit Price</th>
                      <th style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={item.product_id}>
                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                        </td>
                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>{item.quantity}</td>
                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', textAlign: 'right', fontWeight: 600 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', margin: '0 auto' }}
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Draft Summary Footer */}
          {orderItems.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Order Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                ${calculatedTotal.toFixed(2)}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitLoading || orderItems.length === 0}
            >
              {submitLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
