const Hero = () => (
  <section className="hero-section">
    <div className="hero-content">
      {/* ✅ AVATAR AURA + FLAMMES */}
      <div className="hero-visual">
        <div className="flame-glow"></div>
        <div className="metal-avatar-wrapper">
          <img src="/images/avatar.webp" alt="Moi" className="metal-avatar" />
        </div>
      </div>
      
      {/* ✅ TEXTE + TECH + CTAs */}
      <div className="hero-text">
        <h1 data-text="FULL STACK">FULL STACK</h1>
        <p className="hero-subtitle">DEVELOPPEUR | MARSEILLE</p>
        <div className="tech-stack">
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node.js</span>
          <span className="tech-badge">MySQL</span>
          <span className="tech-badge">Sass</span>
        </div>
        <div className="hero-cta">
          <a href="/projects" className="btn btn-secondary">Projets</a>
          <a href="/contact" className="btn btn-secondary">Contact</a>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
