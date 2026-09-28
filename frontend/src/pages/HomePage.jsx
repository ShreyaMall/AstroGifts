import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import React from 'react';

import HeroSlider from '../components/home/HeroSlider';
import OurCategories from '../components/home/OurCategories';
import WeeklyBestsellers from '../components/home/WeeklyBestsellers';
import ProductCollections from '../components/home/ProductCollections';
import LatestArticles from '../components/home/LatestArticles';

export default function HomePage() {
  return (
    <div className="homepage-view">
      <Header />
      <main>
        <HeroSlider />
        <OurCategories />
        <WeeklyBestsellers />
        <ProductCollections />
        <LatestArticles />
      </main>
      <Footer />
    </div>
  );
}
