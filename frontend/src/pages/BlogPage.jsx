import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';
import { articlesApi } from '../services/api';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    articlesApi.getAll()
      .then(res => {
         if (res && res.data) {
             setArticles(res.data);
         }
      })
      .catch(err => console.error("Failed to load articles", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="blog-page">
      <Header />
      <div className="blog-hero">
        <h1 className="blog-hero__title">Homewood Decor Journal</h1>
        <p className="blog-hero__subtitle">Interior design trends, carpentry craftsmanship & furniture styling guides</p>
      </div>

      <div className="blog-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading articles...</div>
        ) : (
          <div className="blog-grid">
            {articles.map(art => (
              <Link key={art.id} to={`/blog/${art.slug}`} className="blog-card">
              <div className="blog-card__img-wrap">
                <img src={art.img || art.image_url || art.image} alt={art.title} className="blog-card__img" />
              </div>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span className="blog-card__cat">{art.category}</span>
                  <span>/</span>
                  <span>{art.date || (art.created_at ? new Date(art.created_at).toLocaleDateString() : '')}</span>
                </div>
                <h2 className="blog-card__title">{art.title}</h2>
                <p className="blog-card__excerpt">{art.excerpt}</p>
                <span className="blog-card__readmore">
                  Read Full Article →
                </span>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>

      </div>
  );
}
