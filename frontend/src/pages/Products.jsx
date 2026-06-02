import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { ProductAPI } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null means "Create Mode", otherwise "Edit Mode"
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductAPI.getAll();
      setProducts(data);
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const triggerAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 6000);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormValues({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock_quantity: product.stock_quantity
      });
    } else {
      setCurrentProduct(null);
      setFormValues({
        name: '',
        sku: '',
        price: '',
        stock_quantity: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validations
    if (!formValues.name.trim() || !formValues.sku.trim() || !formValues.price || !formValues.stock_quantity) {
      triggerAlert('error', 'Please fill out all fields correctly.');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload = {
        name: formValues.name,
        sku: formValues.sku.toUpperCase(),
        price: parseFloat(formValues.price),
        stock_quantity: parseInt(formValues.stock_quantity, 10)
      };

      if (currentProduct) {
        // Edit Mode
        const updated = await ProductAPI.update(currentProduct.id, payload);
        triggerAlert('success', `Product "${updated.name}" updated successfully!`);
      } else {
        // Create Mode
        const created = await ProductAPI.create(payload);
        triggerAlert('success', `Product "${created.name}" created successfully!`);
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}"?`)) return;

    try {
      setLoading(true);
      await ProductAPI.delete(product.id);
      triggerAlert('success', `Product "${product.name}" deleted successfully.`);
      fetchProducts();
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to delete product.');
      setLoading(false);
    }
  };

  // Live filter
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <span className="badge badge-danger">Out of stock</span>;
    if (quantity < 10) return <span className="badge badge-warning">{quantity} Low Stock</span>;
    return <span className="badge badge-success">{quantity} In stock</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Product Management</h1>
          <p>Register SKUs, manage pricing, and adjust stock quantities</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Product SKU
        </button>
      </div>

      <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo({ type: '', message: '' })} />

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching product listings..." />
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No products matched your criteria. Let's create one!
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Unit Price</th>
                <th>Stock Quantity</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{product.id}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--secondary)' }}>{product.sku}</td>
                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                  <td style={{ fontWeight: 500 }}>${parseFloat(product.price).toFixed(2)}</td>
                  <td>{getStockBadge(product.stock_quantity)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => handleOpenModal(product)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.6rem', boxShadow: 'none' }}
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentProduct ? 'Edit Product' : 'Add New Product SKU'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              name="name"
              required
              className="form-control"
              placeholder="e.g. Premium Ergonomic Keyboard"
              value={formValues.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>SKU (Stock Keeping Unit)</label>
            <input 
              type="text" 
              name="sku"
              required
              disabled={!!currentProduct} // SKUs are immutable keys usually in production
              className="form-control"
              placeholder="e.g. TECH-KEY-001"
              value={formValues.sku}
              onChange={handleInputChange}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input 
                type="number" 
                name="price"
                required
                min="0.00"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={formValues.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Initial Stock</label>
              <input 
                type="number" 
                name="stock_quantity"
                required
                min="0"
                step="1"
                className="form-control"
                placeholder="0"
                value={formValues.stock_quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : currentProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
