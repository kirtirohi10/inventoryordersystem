import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { CustomerAPI } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null); // null means Create, otherwise Edit
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerAPI.getAll();
      setCustomers(data);
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const triggerAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 6000);
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormValues({
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      });
    } else {
      setCurrentCustomer(null);
      setFormValues({
        name: '',
        email: '',
        phone: ''
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
    
    // Validations
    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.phone.trim()) {
      triggerAlert('error', 'Please fill out all fields.');
      return;
    }

    try {
      setSubmitLoading(true);
      const payload = {
        name: formValues.name,
        email: formValues.email.trim().toLowerCase(),
        phone: formValues.phone.trim()
      };

      if (currentCustomer) {
        // Edit Mode
        const updated = await CustomerAPI.update(currentCustomer.id, payload);
        triggerAlert('success', `Customer "${updated.name}" updated successfully!`);
      } else {
        // Create Mode
        const created = await CustomerAPI.create(payload);
        triggerAlert('success', `Customer "${created.name}" registered successfully!`);
      }

      handleCloseModal();
      fetchCustomers();
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to save customer');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) return;

    try {
      setLoading(true);
      await CustomerAPI.delete(customer.id);
      triggerAlert('success', `Customer "${customer.name}" removed successfully.`);
      fetchCustomers();
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to delete customer.');
      setLoading(false);
    }
  };

  // Live filter
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone.includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Customer Management</h1>
          <p>Register new clients, edit profiles, and view accounts contact details</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Register Customer
        </button>
      </div>

      <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo({ type: '', message: '' })} />

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone number..." 
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching client index..." />
      ) : filteredCustomers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No customer accounts found matching search criteria.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{customer.id}</td>
                  <td style={{ fontWeight: 600 }}>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => handleOpenModal(customer)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.6rem', boxShadow: 'none' }}
                        onClick={() => handleDeleteCustomer(customer)}
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
        title={currentCustomer ? 'Edit Customer Info' : 'Register New Customer'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              className="form-control"
              placeholder="e.g. John Doe"
              value={formValues.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              required
              className="form-control"
              placeholder="e.g. john.doe@example.com"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              required
              className="form-control"
              placeholder="e.g. +1 (555) 019-2834"
              value={formValues.phone}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Registering...' : currentCustomer ? 'Save Changes' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
