import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LatestArticles.css';
import { articlesApi } from '../../services/api';

const articleToysImg = '/article_toys.png';
const articleAstroImg = '/article_astrology.png';
const articleGiftingImg = '/article_gifting.png';
const articleWoodImg = '/article_wood.png';

const DEFAULT_ARTICLES = [
  {
    id: 'a1',
    title: 'Choosing Safe & Educational Toys for Kids',
    slug: 'choosing-safe-and-educational-toys-for-kids',
    category: 'Toys Guide',
    excerpt: 'Explore wooden toys, soft plushies, and cognitive board games designed for growing young minds.',
    author: 'AstroGifts Team',
    date: '22 Sep 2026',
    img: articleToysImg,
    comments: 6
  },
  {
    id: 'a2',
    title: 'Healing Power of Gemstones & Healing Crystals',
    slug: 'healing-power-of-gemstones-and-crystals',
    category: 'Astrology',
    excerpt: 'Learn how Rose Quartz, Amethyst, and Pyrite bring positive energy, wealth, and peace into your home.',
    author: 'AstroGifts Team',
    date: '20 Sep 2026',
    img: articleAstroImg,
    comments: 10
  },
  {
    id: 'a3',
    title: 'Top 10 Gifting Ideas for Birthdays & Anniversaries',
    slug: 'top-10-gifting-ideas-for-birthdays-and-anniversaries',
    category: 'Gifting Guide',
    excerpt: 'Discover how to choose meaningful, personalized gift hampers that make every celebration unforgettable.',
    author: 'AstroGifts Team',
    date: '15 Sep 2026',
    img: articleGiftingImg,
    comments: 14
  },
  {
    id: 'a4',
    title: 'Wood Types: Oak vs Walnut vs Pine',
    slug: 'wood-types-oak-vs-walnut-vs-pine',
    category: 'Materials',
    excerpt: 'Understand grain patterns, hardness, and aging characteristics to pick the right solid wood.',
    author: 'AstroGifts Team',
    date: '18 Jul 2026',
    img: articleWoodImg,
    comments: 18
  }
];

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getTopicImage = (art, idx = 0) => {
  if (!art) return DEFAULT_ARTICLES[idx % 4].img;
  const category = (art.category || '').toLowerCase();
  const slug = (art.slug || '').toLowerCase();
  const title = (art.title || '').toLowerCase();

  // Check category first, then slug, then title
  if (category.includes('toy') || slug.includes('toy') || title.includes('toy')) {
    return articleToysImg;
  }
  if (
    category.includes('astro') ||
    category.includes('gemstone') ||
    category.includes('crystal') ||
    slug.includes('gemstone') ||
    slug.includes('crystal') ||
    slug.includes('astro') ||
    title.includes('gemstone') ||
    title.includes('crystal') ||
    title.includes('astro')
  ) {
    return articleAstroImg;
  }
  if (
    category.includes('gift') ||
    slug.includes('gift') ||
    slug.includes('birthday') ||
    slug.includes('anniversary') ||
    title.includes('gifting') ||
    title.includes('gift') ||
    title.includes('birthday') ||
    title.includes('anniversary')
  ) {
    return articleGiftingImg;
  }
  if (
    category.includes('wood') ||
    category.includes('material') ||
    category.includes('timber') ||
    slug.includes('wood') ||
    title.includes('wood')
  ) {
    return articleWoodImg;
  }

  const fallbacks = [articleToysImg, articleAstroImg, articleGiftingImg, articleWoodImg];
  return fallbacks[idx % fallbacks.length];
};

const resolveArticleImage = (art, idx) => {
  const rawImg = art.image || art.image_url || art.img;
  if (rawImg && typeof rawImg === 'string' && rawImg.trim()) {
    const cleanImg = rawImg.trim();
    if (/^https?:\/\//i.test(cleanImg)) {
      return cleanImg;
    }
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
    if (cleanImg.startsWith('/')) {
      return `${apiBase}${cleanImg}`;
    }
    return `${apiBase}/${cleanImg}`;
  }
  return getTopicImage(art, idx);
};

export default function LatestArticles() {
  const [readMoreExpanded, setReadMoreExpanded] = useState(false);
  const [articles, setArticles] = useState(DEFAULT_ARTICLES);
  const [copiedId, setCopiedId] = useState(null);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    articlesApi.getAll()
      .then(res => {
        if (!isMounted) return;
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((art, idx) => {
            const finalImg = resolveArticleImage(art, idx);
            const resolvedDate = formatDate(art.date || art.created_at || art.date_label);

            return {
              ...art,
              id: art.id ?? idx,
              title: art.title,
              slug: art.slug,
              category: art.category || 'Guide',
              excerpt: art.excerpt,
              author: art.author || 'AstroGifts Team',
              date: resolvedDate || art.date || '',
              img: finalImg,
              comments: art.comments_count ?? art.comments ?? 0
            };
          });

          if (formatted.length < 4) {
            const missing = DEFAULT_ARTICLES.slice(formatted.length, 4);
            setArticles([...formatted, ...missing]);
          } else {
            setArticles(formatted.slice(0, 4));
          }
        }
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error("Failed to load articles", err);
        }
      });

    return () => {
      isMounted = false;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleShare = async (e, article) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/blog/${article.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(article.id);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch {
        // Silently ignore clipboard failures
      }
    }
  };

  return (
    <section className="la-section" id="latest-articles" aria-labelledby="la-heading-id">
      <div className="la-container">
        {/* Header */}
        <div className="la-header">
          <h2 className="la-title" id="la-heading-id">Latest articles</h2>
          <Link to="/blog" className="la-blog-btn" id="visit-blog-btn">
            Visit the Blog <span>→</span>
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="la-grid">
          {articles.map((article, idx) => (
            <article key={article.id ?? idx} className="la-card" id={`article-${article.id ?? idx}`}>
              {/* Image Container */}
              <div className="la-card__img-wrap">
                <Link
                  to={`/blog/${article.slug}`}
                  aria-hidden="true"
                  tabIndex={-1}
                  className="la-card__img-link"
                >
                  <img
                    src={article.img || getTopicImage(article, idx)}
                    alt={article.title}
                    className="la-card__img"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="250"
                    onError={(e) => {
                      const fallback = getTopicImage(article, idx);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </Link>

                {/* Author & Stats overlay at bottom of image */}
                <div className="la-card__overlay">
                  <div className="la-card__author">
                    <div className="la-card__avatar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 1-4-4H8a4 4 0 0 1-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="la-card__author-name">{article.author}</span>
                  </div>

                  <div className="la-card__stats">
                    {/* Share icon button */}
                    <div className="la-card__share-wrap">
                      <button
                        type="button"
                        className="la-card__stat-icon la-card__stat-icon--share"
                        aria-label={`Share ${article.title}`}
                        onClick={(e) => handleShare(e, article)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </button>
                      {copiedId === (article.id ?? idx) && (
                        <span className="la-card__copied-badge" aria-live="polite">
                          Link copied
                        </span>
                      )}
                    </div>

                    {/* Comment count */}
                    <div className="la-card__stat-icon la-card__stat-icon--comments" aria-label={`${article.comments ?? 0} comments`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="la-card__comment-count">{article.comments ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="la-card__content">
                <div className="la-card__meta">
                  <span className="la-card__cat">{article.category}</span>
                  <span className="la-card__sep">/</span>
                  <span className="la-card__date">{article.date}</span>
                </div>

                <h3 className="la-card__title">
                  <Link to={`/blog/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="la-card__excerpt">{article.excerpt}</p>

                <Link to={`/blog/${article.slug}`} className="la-card__link">
                  Continue reading
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ── SEO / Bottom Text Section ── */}
        <div className="la-footer-seo">
          <div className="la-seo__block">
            <h3 className="la-seo__headline">
              Online store with a wide selection of luxury gifts, toys & astrology decor
            </h3>
            <p className="la-seo__desc">
              Gifts and spiritual decor add warmth, harmony, and joy to every home and occasion. AstroGifts offers a handpicked collection of personalized gift hampers, eco-friendly wooden toys, birthstones, and healing crystal jewelry to make every celebration special.
            </p>
          </div>

          <div className="la-seo__block">
            <h3 className="la-seo__headline">
              Thoughtful gifting & celestial craftsmanship for your loved ones
            </h3>
            <p className="la-seo__desc">
              Our master artisans and crystal experts curate unique gift sets, spiritual brass idols, and safe toys crafted to bring prosperity, positive energy, and happiness to your family.
              {readMoreExpanded && (
                <span id="la-seo-expanded-text">
                  {' '}Over the years, AstroGifts has become India's trusted destination for certified gemstones, festive gift boxes, and meaningful surprises.
                </span>
              )}
            </p>

            <button
              type="button"
              className="la-seo__readmore-btn"
              onClick={() => setReadMoreExpanded(prev => !prev)}
              id="read-more-btn"
              aria-expanded={readMoreExpanded}
              aria-controls="la-seo-expanded-text"
            >
              {readMoreExpanded ? 'Read less' : 'Read more'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
