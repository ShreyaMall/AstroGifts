import React from 'react';
import './ProductCollections.css';

import product4 from '../../assets/product4.jpg';
import product5 from '../../assets/product5.jpg';
import product6 from '../../assets/product6.jpg';
import product7 from '../../assets/product7.jpg';
import product8 from '../../assets/product8.jpg';
import product9 from '../../assets/product9.jpg';
import product10 from '../../assets/product10.jpg';
import productVideo from '../../assets/product.mp4';

const ProductCollections = () => {
  return (
    <div className="pc-wrapper">
      <div className="pc-header">
        <h2 className="pc-title">Product collections</h2>
        <p className="pc-subtitle">Explore product collections from our vendors</p>
      </div>

      <div className="pc-grid">

        {/* Column 1: Green sofa + Wicker chair */}
        <div className="pc-col">
          <div className="pc-card h-325">
            <img src={product9} alt="Green living room" className="pc-img" />
          </div>
          <div className="pc-card h-325">
            <img src={product5} alt="Wicker chair" className="pc-img" />
          </div>
        </div>

        {/* Column 2: Orange sofa + GLADØM */}
        <div className="pc-col">
          <div className="pc-card h-450">
            <img src={product10} alt="Orange sofa room" className="pc-img" />
          </div>
          <div className="pc-card h-200 card-gladom">
            <div className="pc-text-inner">
              <h3 className="pc-text-title">GLADØM</h3>
              <p className="pc-text-desc">
                The new common language will be more simple and regular than the existing languages
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Video + Bedroom */}
        <div className="pc-col">
          <div className="pc-card h-325">
            <video
              src={productVideo}
              className="pc-img"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="pc-card h-325">
            <img src={product6} alt="Bedroom" className="pc-img" />
          </div>
        </div>

        {/* Column 4: HÄLLAN + Dark Dining */}
        <div className="pc-col">
          <div className="pc-card h-200 card-hallan">
            <div className="pc-text-inner">
              <span className="pc-text-label">HÄLLAN</span>
              <h3 className="pc-text-title">HÄLLAN</h3>
              <p className="pc-text-desc">
                The new common language will be more simple and regular than the existing languages
              </p>
            </div>
          </div>
          <div className="pc-card h-450">
            <img src={product7} alt="Dining room" className="pc-img" />
          </div>
        </div>

        {/* Column 5: Dark Armchair + Kids Room */}
        <div className="pc-col">
          <div className="pc-card h-350">
            <img src={product4} alt="Armchair with lamp" className="pc-img" />
          </div>
          <div className="pc-card h-300">
            <img src={product8} alt="Kids room storage" className="pc-img" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCollections;