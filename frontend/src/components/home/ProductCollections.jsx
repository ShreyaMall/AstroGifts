import React, { useRef, useEffect } from 'react';
import './ProductCollections.css';

import giftsImg from '../../assets/gifts.jpg';
import giftItemImg from '../../assets/gift image.jpg';
import astroImg from '../../assets/astro.jpg';
import astriImg from '../../assets/astri image.jpg';
import astroVideoFile from '../../assets/same_as_it_video_cahiye_but_wo.mp4';
import thodaVideoFile from '../../assets/thoda_change_kar_do_cup_ko_rem.mp4';
import whatsAppVideoFile from '../../assets/WhatsApp Video.mp4';
import stackedGiftBoxesImg from '../../assets/Download premium png of Stacked gift boxes editable mockup about christmas.jpg';

const ProductCollections = () => {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.tagName.toLowerCase() === 'video') {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        }
      });
    }, { threshold: 0.1 });

    const videos = [videoRef1.current, videoRef2.current, videoRef3.current].filter(Boolean);
    videos.forEach(vid => observer.observe(vid));
    
    // Initial play in case already intersecting
    videos.forEach(vid => vid.play().catch(err => console.log("Video handled:", err)));

    return () => {
      videos.forEach(vid => observer.unobserve(vid));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pc-wrapper">
      <div className="pc-header">
        <h2 className="pc-title">Gifts & Astrology Collections</h2>
        <p className="pc-subtitle">Explore curated gifts, sacred astrology crystals & premium toys</p>
      </div>

      <div className="pc-grid">

        {/* Column 1: Sacred Astrology & Video */}
        <div className="pc-col">
          <div className="pc-card h-325">
            <img src={astroImg} alt="Astrology & Gemstones" className="pc-img" loading="lazy" decoding="async" />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Astrology & Gemstones</span>
            </div>
          </div>
          <div className="pc-card h-325 pc-card--video">
            <video
              ref={videoRef2}
              src={thodaVideoFile}
              className="pc-img"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{ pointerEvents: 'none' }}
            />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Astrology Collection</span>
            </div>
          </div>
        </div>

        {/* Column 2: Luxury Gifts & Special Gifts Text Card */}
        <div className="pc-col">
          <div className="pc-card h-450">
            <img src={giftsImg} alt="Luxury Gift Hampers" className="pc-img" loading="lazy" decoding="async" />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Luxury Gift Hampers</span>
            </div>
          </div>
          <div className="pc-card h-200 card-gladom">
            <div className="pc-text-inner">
              <span className="pc-text-label">EXCLUSIVES</span>
              <h3 className="pc-text-title">Special Gifts</h3>
              <p className="pc-text-desc">
                Curated gift boxes, personalized hampers & festive surprises for your loved ones
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Astrology Video Showcase & Stacked Gift Boxes */}
        <div className="pc-col">
          <div className="pc-card h-325 pc-card--video">
            <video
              ref={videoRef1}
              src={astroVideoFile}
              className="pc-img"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{ pointerEvents: 'none' }}
            />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Sacred Items</span>
            </div>
          </div>
          <div className="pc-card h-325">
            <img src={stackedGiftBoxesImg} alt="Stacked Gift Boxes Showcase" className="pc-img" loading="lazy" decoding="async" />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Stacked Gift Boxes</span>
            </div>
          </div>
        </div>

        {/* Column 4: Divine Astro Text & Zodiac Collection */}
        <div className="pc-col">
          <div className="pc-card h-200 card-hallan">
            <div className="pc-text-inner">
              <span className="pc-text-label">ASTROLOGY</span>
              <h3 className="pc-text-title">Rings & Gemstones</h3>
              <p className="pc-text-desc">
                Discover certified gemstones, healing crystals, pendants & lucky charm bracelets
              </p>
            </div>
          </div>
          <div className="pc-card h-450">
            <img src={astriImg} alt="Crystals & Sacred Jewels" className="pc-img" loading="lazy" decoding="async" />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Crystals & Jewels</span>
            </div>
          </div>
        </div>

        {/* Column 5: Special Gift Items & WhatsApp Video */}
        <div className="pc-col">
          <div className="pc-card h-350">
            <img src={giftItemImg} alt="Special Occasion Gift" className="pc-img" loading="lazy" decoding="async" />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Special Occasions</span>
            </div>
          </div>
          <div className="pc-card h-300 pc-card--video">
            <video
              ref={videoRef3}
              src={whatsAppVideoFile}
              className="pc-img"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{ pointerEvents: 'none' }}
            />
            <div className="pc-overlay">
              <span className="pc-overlay-title">Gifting Ideas</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCollections;