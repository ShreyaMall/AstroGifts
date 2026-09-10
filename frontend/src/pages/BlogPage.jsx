import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';


import { BLOG_ARTICLES } from '../data/blogData';

export default function BlogPage() {
  return (
    <div className="blog-page">
      <Header />
      <div className="blog-hero">
        <h1 className="blog-hero__title">Homewood Decor Journal</h1>
        <p className="blog-hero__subtitle">Interior design trends, carpentry craftsmanship & furniture styling guides</p>
      </div>

      <div className="blog-container">
        <div className="blog-grid">
          {BLOG_ARTICLES.map(art => (
            <Link key={art.id} to={`/blog/${art.slug}`} className="blog-card">
              <div className="blog-card__img-wrap">
                <img src={art.img} alt={art.title} className="blog-card__img" />
              </div>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span className="blog-card__cat">{art.category}</span>
                  <span>/</span>
                  <span>{art.date}</span>
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
      </div>

      </div>
  );
}
