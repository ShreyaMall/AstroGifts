import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../services/api';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    productsApi.getAll({ search: query, per_page: 50 })
      .then(res => {
        if (res && res.data) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch search results", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="search-page-wrapper">
      <Header />

      <main className="search-main">
        <div className="search-header">
          <div className="search-container">
            <h1 className="search-title">Search Results</h1>
            <p className="search-subtitle">
              {query ? `Showing results for "${query}"` : 'Please enter a search keyword'}
            </p>
          </div>
        </div>

        <div className="search-container search-content">
          {loading ? (
            <div className="search-loading">
              <div className="search-spinner"></div>
              <p>Searching for products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="search-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} viewMode="grid-4" />
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h2>No products found</h2>
              <p>No products found for '{query}'. Try searching with different keywords.</p>
              <Link to="/category/gifts" className="search-btn-continue">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
