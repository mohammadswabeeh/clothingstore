import { useEffect, useState } from 'react';
import api from './api';
import CartSidebar from './components/CartSidebar';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('clothing_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('clothing_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    api.get('categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // 1. Extracted fetchProducts function
  const fetchProducts = () => {
    setLoading(true);
    const url = selectedCategory
      ? `products/?category=${selectedCategory}`
      : 'products/';

    api.get(url)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Clothing Store</h2>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${selectedCategory === '' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="row g-4">
              {products.map((product) => (
                <div key={product.id} className="col-md-6">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                      className="card-img-top"
                      alt={product.name}
                      style={{ height: '240px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <span className="badge bg-secondary align-self-start mb-2">
                        {product.category_name} • Size {product.size} • Stock: {product.stock}
                      </span>
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.description || 'Premium apparel item.'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="fw-bold fs-5">₹{product.price}</span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* 2. Passed onOrderSuccess prop */}
          <CartSidebar
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onClear={() => setCart([])}
            onOrderSuccess={fetchProducts}
          />
        </div>
      </div>
    </div>
  );
}

export default App;