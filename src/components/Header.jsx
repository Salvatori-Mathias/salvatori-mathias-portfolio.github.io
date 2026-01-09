import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        {/* Logo */}
        <motion.a 
          href="/" 
          className="logo"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          Portfolio
        </motion.a>

        {/* Desktop Menu */}
        <ul className="desktop-nav">
          <li><a href="/" className="nav-link">Accueil</a></li>
          <li><a href="/projects" className="nav-link">Projets</a></li>
          <li><a href="/contact" className="nav-link">Contact</a></li>
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mobile-menu"
        >
          <ul>
            <li><a href="/" className="nav-link">Accueil</a></li>
            <li><a href="/projects" className="nav-link">Projets</a></li>
            <li><a href="/contact" className="nav-link">Contact</a></li>
          </ul>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
