import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './BlogPage.css';
import { articlesApi, commentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Prefill user details if available
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  // Load article & comments
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setLoadingComments(true);

    articlesApi.getBySlug(slug)
      .then(res => {
        if (res && res.data) setArticle(res.data);
      })
      .catch(err => console.error("Failed to load article", err))
      .finally(() => setLoading(false));

    commentsApi.getBySlug(slug)
      .then(res => {
        if (res && res.data) setComments(res.data);
      })
      .catch(err => console.error("Failed to load comments", err))
      .finally(() => setLoadingComments(false));
  }, [slug]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await commentsApi.create(slug, {
        name: name.trim() || user?.name || 'Guest Reader',
        email: email.trim() || user?.email || '',
        comment: commentText.trim(),
      });

      if (res && (res.success || res.status === 'success') && res.data) {
        setComments(prev => [res.data, ...prev]);
        setCommentText('');
        setMessage({ text: 'Comment posted successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: 'Failed to post comment. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to post comment', err);
      setMessage({ text: 'Failed to post comment. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-page">
        <Header />
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>Loading article...</div>
        <Footer />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <Header />
      <div className="blog-container" style={{ maxWidth: '860px', margin: '40px auto 60px', padding: '0 20px' }}>
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

        {/* ── COMMENTS LIST ── */}
        <div style={{ marginTop: '50px', marginBottom: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Comments
            <span style={{ fontSize: '13px', background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: '12px', fontWeight: '600' }}>
              {comments.length}
            </span>
          </h3>

          {loadingComments ? (
            <div style={{ color: '#64748b', fontSize: '14px', padding: '12px 0' }}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comments.map((c, idx) => (
                <div
                  key={c._id || c.id || idx}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img
                      src={c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name || 'Guest')}&background=fbe2d0&color=d96b27`}
                      alt={c.user_name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #f1f5f9' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>
                        {c.user_name || 'Guest Reader'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── LEAVE A REPLY FORM ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Leave a Reply</h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>Your email address will not be published. Required fields are marked *</p>

          {message.text && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '13.5px',
              fontWeight: '500',
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmitComment}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Comment *
              </label>
              <textarea
                placeholder="Write your thoughts or feedback here..."
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? '#94a3b8' : '#d96b27',
                color: '#fff',
                border: 'none',
                padding: '11px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {submitting ? 'Posting Comment...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
