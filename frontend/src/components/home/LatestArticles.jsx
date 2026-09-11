import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LatestArticles.css';
import { articlesApi } from '../../services/api';

export default function LatestArticles() {
  const [readMoreExpanded, setReadMoreExpanded] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesApi.getAll()
      .then(res => {
         if (res && res.data) {
             setArticles(res.data.slice(0, 4));
         }
      })
      .catch(err => console.error("Failed to load articles", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="la-section" id="latest-articles">
      <div className="la-container">
        {/* Header */}
        <div className="la-header">
          <h2 className="la-title">Latest articles</h2>
          <Link to="/blog" className="la-blog-btn" id="visit-blog-btn">
            Visit the Blog <span>→</span>
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="la-grid">
          {loading ? (
             <div style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center' }}>Loading articles...</div>
          ) : (
            articles.map((article) => (
              <article key={article.id} className="la-card" id={`article-${article.id}`}>
                {/* Image Container */}
                <Link to={`/blog/${article.slug}`} className="la-card__img-wrap">
                  <img src={article.img || article.image_url || article.image} alt={article.title} className="la-card__img" />

                  {/* Author & Stats overlay at bottom of image */}
                <div className="la-card__overlay">
                  <div className="la-card__author">
                    <div className="la-card__avatar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 1-4-4H8a4 4 0 0 1-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span>{article.author}</span>
                  </div>

                  <div className="la-card__stats">
                    {/* Share icon */}
                    <button
                      className="la-card__stat-icon"
                      aria-label="Share"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard?.writeText(window.location.origin + `/blog/${article.slug}`);
                        alert('Article link copied to clipboard!');
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>

                    {/* Comment count */}
                    <div className="la-card__stat-icon la-card__stat-icon--comments">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="la-card__comment-count">{article.comments || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Text Content */}
              <div className="la-card__content">
                <div className="la-card__meta">
                  <span className="la-card__cat">{article.category}</span>
                  <span className="la-card__sep">/</span>
                  <span className="la-card__date">{article.date || (article.created_at ? new Date(article.created_at).toLocaleDateString() : '')}</span>
                </div>

                <h3 className="la-card__title">
                  <Link to={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {article.title}
                  </Link>
                </h3>
                <p className="la-card__excerpt">{article.excerpt}</p>

                <Link to={`/blog/${article.slug}`} className="la-card__link">
                  Continue reading
                </Link>
              </div>
            </article>
            ))
          )}
        </div>

        {/* ── SEO / Bottom Text Section ── */}
        <div className="la-footer-seo">
          <div className="la-seo__block">
            <h3 className="la-seo__headline">
              Online store with a wide selection of furniture and decor
            </h3>
            <p className="la-seo__desc">
              Furniture is an invariable attribute of any room. It is they who give it the right atmosphere, making the space cozy and comfortable, creating favorable conditions for productive work or helping to relax after a hard day. More and more often, customers want to place an order in an online store, when you can sit down at the computer in your free time, arrange the furniture in the photo and calmly buy the furniture you like. The online store has a large catalog of both home and office furniture.
            </p>
          </div>

          <div className="la-seo__block">
            <h3 className="la-seo__headline">
              Furniture production is a modern form of art
            </h3>
            <p className="la-seo__desc">
              Furniture manufacturers, as well as manufacturers of other home goods, are full of amazing offers: we often come across both standard mass-produced products and unique creations – furniture from professional craftsmen, which will be appreciated by true connoisseurs of beauty. We have selected for you the best models from modern craftsmen who managed to ingeniously combine elegance, quality and practicality in each product unit. Our assortment includes products from proven companies. Who for
              {readMoreExpanded && (
                <span>
                  {' '}many years of their activity have proven their reliability, high quality and excellent design characteristics of their products.
                </span>
              )}
            </p>

            <button
              type="button"
              className="la-seo__readmore-btn"
              onClick={() => setReadMoreExpanded(prev => !prev)}
              id="read-more-btn"
            >
              {readMoreExpanded ? 'Read less' : 'Read more'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
