import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPage.css';
import { articlesApi } from '../services/api';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    articlesApi.getBySlug(slug)
      .then(res => {
         if (res && res.data) setArticle(res.data);
      })
      .catch(err => console.error("Failed to load article", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-page">
        <Header />
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-page">
      <Header />
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>Article not found</h2>
          <Link to="/blog" style={{ color: '#d96b27', marginTop: '16px', display: 'inline-block' }}>Back to Journal</Link>
        </div>
        </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-container" style={{ maxWidth: '860px' }}>
        <div style={{ marginBottom: '20px', fontSize: '13px', color: '#888' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/blog" style={{ color: '#666', textDecoration: 'none' }}>Blog</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#222', fontWeight: '600' }}>{article.title}</span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 16px', lineHeight: '1.3' }}>
          {article.title}
        </h1>

        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#777', marginBottom: '24px', alignItems: 'center' }}>
          <span>By <strong>{article.author || 'Admin'}</strong></span>
          <span>•</span>
          <span>{article.date || (article.created_at ? new Date(article.created_at).toLocaleDateString() : '')}</span>
          <span>•</span>
          <span style={{ color: '#d96b27', fontWeight: '600' }}>{article.category}</span>
        </div>

        <div style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '420px', marginBottom: '32px' }}>
          <img src={article.img || article.image_url || article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#444', whiteSpace: 'pre-line', marginBottom: '40px' }}>
          {article.content}
        </div>

        {article.tags && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Tags:</span>
            {article.tags.map(tag => (
              <span key={tag} style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#555' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Leave a Reply</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert('Comment posted for review!'); }}>
            <textarea
              placeholder="Write your comment..."
              rows={4}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '12px', outline: 'none' }}
              required
            />
            <button
              type="submit"
              style={{ background: '#d96b27', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
            >
              Post Comment
            </button>
          </form>
        </div>
      </div>

      </div>
  );
}
