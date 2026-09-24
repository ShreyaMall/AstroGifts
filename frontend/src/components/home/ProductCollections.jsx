import React, { useRef, useEffect } from 'react';
import './ProductCollections.css';

import giftsImg from '../../assets/gifts.png';
import giftItemImg from '../../assets/gift image.jpg';
import astroImg from '../../assets/astro.png';
import astriImg from '../../assets/astri image.jpg';
import astroVideoFile from '../../assets/same_as_it_video_cahiye_but_wo.mp4';
import thodaVideoFile from '../../assets/thoda_change_kar_do_cup_ko_rem.mp4';
import whatsAppVideoFile from '../../assets/WhatsApp Video.mp4';
import toysBannerImg from '../../assets/toys_collection_banner.jpg';

const ProductCollections = () => {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);

  useEffect(() => {
    if (videoRef1.current) videoRef1.current.play().catch(err => console.log("Video1 handled:", err));
    if (videoRef2.current) videoRef2.current.play().catch(err => console.log("Video2 handled:", err));
    if (videoRef3.current) videoRef3.current.play().catch(err => console.log("Video3 handled:", err));
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
            <img src={astroImg} alt="Astrology & Gemstones" className="pc-img" />
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
            />
          </div>
        </div>

        {/* Column 2: Luxury Gifts & Special Gifts Text Card */}
        <div className="pc-col">
          <div className="pc-card h-450">
            <img src={giftsImg} alt="Luxury Gift Hampers" className="pc-img" />
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

        {/* Column 3: Astrology Video Showcase & Toys */}
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
            />
          </div>
          <div className="pc-card h-325 pc-card--video">
            <img src={toysBannerImg} alt="Toys Collection Showcase" className="pc-img" />
            <div className="pc-video-play-overlay">
              <div className="pc-play-icon">▶</div>
              <span className="pc-play-label">TOYS COLLECTION</span>
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
            <img src={astriImg} alt="Crystals & Sacred Jewels" className="pc-img" />
          </div>
        </div>

        {/* Column 5: Special Gift Items & WhatsApp Video */}
        <div className="pc-col">
          <div className="pc-card h-350">
            <img src={giftItemImg} alt="Special Occasion Gift" className="pc-img" />
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
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCollections;