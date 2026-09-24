import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { contactApi } from '../services/api';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    contactApi.submit(formData)
      .then(res => {
        setSubmitMessage('Thank you for contacting us! We will get back to you shortly.');
        setFormData({ name: '', email: '', message: '' });
      })
      .catch(err => {
        setSubmitMessage('Something went wrong. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
        setTimeout(() => setSubmitMessage(''), 5000);
      });
  };


  return (
    <div className="contact-page-wrapper">
      <Header />
      
      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Contact us</h1>
            <div className="contact-breadcrumbs">
              <Link to="/">Home</Link> / <span>Contact us</span>
            </div>
          </div>
          
          <div className="contact-hero-bg">
            <div className="contact-curved-bg"></div>
            {/* The chairs are typically an image, using a placeholder representation or background */}
            <div className="contact-hero-image-overlay"></div>
          </div>
        </section>

        {/* Content Section */}
        <section className="contact-content">
          <div className="contact-container">
            
            {/* Left Column: Form */}
            <div className="contact-form-column">
              <h2 className="contact-section-title">Contact with an expert</h2>
              
              {submitMessage && (
                <div className="contact-success-msg">
                  {submitMessage}
                </div>
              )}
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="contact-input"
                  />
                </div>
                
                <div className="contact-form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="contact-input"
                  />
                </div>
                
                <div className="contact-form-group">
                  <textarea
                    name="message"
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="contact-input contact-textarea"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className={`contact-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Right Column: Get in touch */}
            <div className="contact-getintouch-column">
              <h2 className="contact-section-title">Get in touch</h2>
              
              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div className="contact-info-details">
                    <h3>CALL US</h3>
                    <p>7878787878</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div className="contact-info-details">
                    <h3>MAIL US</h3>
                    <p>info@astrogifts.com</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="8" cy="11" r="1"></circle><circle cx="12" cy="11" r="1"></circle><circle cx="16" cy="11" r="1"></circle></svg>
                  </div>
                  <div className="contact-info-details">
                    <h3>CHAT WITH US</h3>
                    <p>info@astrogifts.com</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    {/* Basic WhatsApp SVG path approximation */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div className="contact-info-details">
                    <h3>WHATS APP</h3>
                    <p>+91 9920012474</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
