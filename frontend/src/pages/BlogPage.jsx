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
        <h1 className="blog-hero__title">AstroGifts Journal</h1>
        <p className="blog-hero__subtitle">Gifts trends, crystal guides & astrology insights</p>
      </div>

      <div className="blog-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading articles...</div>
        ) : (
          <div className="blog-grid">
            {articles.map(art => (
              <Link key={art.id} to={`/blog/${art.slug}`} className="blog-card">
              <div className="blog-card__img-wrap">
                <img 
                  src={(() => {
                    const title = (art.title || '').toLowerCase();
                    const slug = (art.slug || '').toLowerCase();
                    const category = (art.category || '').toLowerCase();
                    if (title.includes('toy') || slug.includes('toy') || category.includes('toy')) return '/article_toys.png';
                    if (title.includes('gemstone') || title.includes('crystal') || slug.includes('gemstone') || category.includes('astro')) return '/article_astrology.png';
                    if (title.includes('gifting') || title.includes('birthday') || title.includes('anniversary') || slug.includes('gift')) return '/article_gifting.png';
                    if (title.includes('wood') || title.includes('flower') || title.includes('decor') || category.includes('material') || category.includes('home')) return '/article_wood.png';
                    const raw = art.image || art.image_url || art.img;
                    if (!raw || typeof raw !== 'string' || !raw.trim()) return '/article_gifting.png';
                    const t = raw.trim();
                    if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t;
                    if (t.startsWith('storage/') || t.startsWith('/storage/')) return `http://127.0.0.1:8000/${t.replace(/^\//, '')}`;
                    if (t.startsWith('/')) return t;
                    return `/${t}`;
                  })()} 
                  alt={art.title} 
                  className="blog-card__img" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/article_gifting.png';
                  }}
                />
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
      <Footer />
    </div>
  );
}
