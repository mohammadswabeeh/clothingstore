import { useState } from 'react';
import api from '../api';

function CartSidebar({ cart, onUpdateQty, onRemove, onClear, onOrderSuccess }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      items: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await api.post('orders/', payload);
      setMessage({ type: 'success', text: `Order #${res.data.id} placed successfully!` });
      setCustomerName('');
      setCustomerEmail('');
      setShippingAddress('');
      onClear();
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.[0] || 'Failed to place order. Check stock availability.';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
        </h5>
        {cart.length > 0 && (
          <button className="btn btn-outline-danger btn-sm" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {message && (
        <div className={`alert alert-${message.type} py-2 small`} role="alert">
          {message.text}
        </div>
      )}

      {cart.length === 0 ? (
        <p className="text-muted small mb-0">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <div className="fw-semibold">{item.name}</div>
                <small className="text-muted">Size {item.size} • ₹{item.price}</small>
              </div>
              <div className="d-flex align-items-center gap-1">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => onUpdateQty(item.id, -1)}>-</button>
                <span className="px-2">{item.quantity}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                <button className="btn btn-sm btn-link text-danger text-decoration-none" onClick={() => onRemove(item.id)}>×</button>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between align-items-center my-3">
            <span className="fw-bold">Total:</span>
            <span className="fw-bold fs-5">₹{total.toFixed(2)}</span>
          </div>

          <form onSubmit={handleCheckout} className="border-top pt-3">
            <h6 className="fw-bold mb-2">Checkout Details</h6>
            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Email Address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control form-control-sm"
                rows="2"
                placeholder="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default CartSidebar;