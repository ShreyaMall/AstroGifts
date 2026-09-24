import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OurCategories.css';
import { categoriesApi } from '../../services/api';

import giftsImg from '../../assets/gifts.png';
import toysImg from '../../assets/toys_collection_banner.jpg';
import astroImg from '../../assets/astro.png';
import flowersImg from '../../assets/flowers.png';
import decorImg from '../../assets/decor1.jpg';
import crystalImg from '../../assets/Rose_Quartz.webp';

const STATIC_FALLBACK_CATEGORIES = [
  { name: 'Gifts',     slug: 'gifts',     img: giftsImg },
  { name: 'Toys',      slug: 'toys',      img: toysImg },
  { name: 'Astrology', slug: 'astrology', img: astroImg },
  { name: 'Flowers',   slug: 'flowers',   img: flowersImg },
  { name: 'Decor',     slug: 'decor',     img: decorImg },
  { name: 'Crystals',  slug: 'crystals',  img: crystalImg },
];

export default function OurCategories() {
  const [categories, setCategories] = useState(STATIC_FALLBACK_CATEGORIES);

  useEffect(() => {
    categoriesApi.getAll()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(c => {
            let imgSrc = c.image;
            if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
              imgSrc = `http://127.0.0.1:8000${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
            }
            const staticMatch = STATIC_FALLBACK_CATEGORIES.find(s => s.slug === c.slug || s.name.toLowerCase() === c.name.toLowerCase());
            return {
              name: c.name,
              slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
              img: imgSrc || staticMatch?.img || giftsImg,
            };
          });
          setCategories(mapped.slice(0, 6));
        }
      })
      .catch(err => {
        console.error("Failed to load categories for homepage", err);
      });
  }, []);

  return (
    <section className="our-categories" id="categories-section">
      <div className="our-categories__container">
        <div className="our-categories__header">
          <h2 className="our-categories__title">Our categories</h2>
          <p className="our-categories__subtitle">Lots of new products and product collections</p>
        </div>
        <div className="our-categories__grid">
          {categories.map((cat, i) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat.name + i}
              className="cat-card"
              id={`cat-${cat.slug}`}
            >
              <div className="cat-card__circle">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="cat-card__img"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = `hsl(${i * 36}, 20%, 75%)`;
                  }}
                />
              </div>
              <span className="cat-card__label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
