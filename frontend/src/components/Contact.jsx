import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lastname: formData.name,
          email: formData.email,
          message: formData.message
        })
      });
      
      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
        setIsSuccessModal(true);
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Network:', error);
      alert('❌ Backend http://localhost:5000 non accessible');
    }
  };

  // ✅ useEffect CORRIGÉ
// ✅ SOLUTION SIMPLE - Variable locale (0 erreur)
useEffect(() => {
  if (isSuccessModal) {
    let count = 4;  // ← Variable LOCALE
    
    const interval = setInterval(() => {
      setCountdown(count);
      count--;
      
      if (count < 0) {
        clearInterval(interval);
        setIsSuccessModal(false);
        navigate('/');  // ← Direct
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, [isSuccessModal, navigate]);  // ✅ Dependencies CLEAN


  // ✅ FONCTION MANQUANTE AJOUTÉE
  const handleCloseAndRedirect = () => {
    setIsSuccessModal(false);
    navigate('/');
  };

  // ✅ return CORRIGÉ
  return (
    <>
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Contact</h2>
          
          <div className="contact-content">
            <div className="contact-info">
              <h3>Travaillons ensemble</h3>
              <p>Envie d'un projet web performant ? Discutons !</p>
              <div className="contact-details">
                <div className="contact-item">
                  <span>Email</span>
                  <a href="mailto:ton@email.com">ton@email.com</a>
                </div>
                <div className="contact-item">
                  <span>LinkedIn</span>
                  <a href="#">ton-profil</a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Votre message..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* MODALE SUCCESS + COUNTER */}
      {isSuccessModal && (
        <div 
          className="success-modal-overlay"
          onClick={handleCloseAndRedirect}
        >
          <div 
            className="success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="success-icon">✅</div>
            <h3>Message reçu !</h3>
            <p>Merci <strong>{formData.name || 'pour votre message'}</strong> !</p>
            <p className="success-small">
              Redirection automatique dans <span className="countdown">{countdown}</span>s...
            </p>
            <button 
              className="btn-primary modal-close-btn"
              onClick={handleCloseAndRedirect}
            >
              ← Retour accueil maintenant
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;
