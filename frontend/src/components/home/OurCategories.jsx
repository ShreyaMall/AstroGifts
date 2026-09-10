import React from 'react';
import { Link } from 'react-router-dom';
import './OurCategories.css';

import chairImg from '../assets/chair.jpg';
import tableImg from '../assets/table 1.jpg';
import sofaImg from '../assets/sofa.jpg';
import armchairImg from '../assets/armchair.jpg';
import bedsImg from '../assets/beds.png';
import storageImg from '../assets/storage.jpg';

const categories = [
  { name: 'Chairs',     slug: 'chairs',    img: chairImg },
  { name: 'Tables',     slug: 'tables',    img: tableImg },
  { name: 'Sofas',      slug: 'sofas',     img: sofaImg },
  { name: 'Armchairs',  slug: 'armchairs', img: armchairImg },
  { name: 'Beds',       slug: 'beds',      img: bedsImg },
  { name: 'Storage',    slug: 'storage',   img: storageImg },
];

export default function OurCategories() {
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
              key={cat.name}
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
