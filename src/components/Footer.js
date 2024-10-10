import React from 'react';
import './css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-about">
                    <h4>About Imagique</h4>
                    <p>
                        Imagique is a premier event management company dedicated to creating unforgettable experiences. With a passion for excellence, we specialize in organizing a wide range of events, from corporate gatherings to spectacular celebrations. Our team of experts ensures that every detail is meticulously planned and executed, delivering seamless events that leave a lasting impression.
                    </p>
                </div>

                {/* Social Media Links */}
                <div className="footer-socials">
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Imagique. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
