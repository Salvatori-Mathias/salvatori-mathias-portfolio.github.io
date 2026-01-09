import { HashRouter as Router, Routes, Route } from 'react-router-dom';  // ✅ HashRouter
import Header from './components/Header';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Admin from './components/Admin';
import Footer from './components/Footer';
import './styles/main.scss';

function App() {
  return (
    <Router>  {/* HashRouter maintenant */}
      <div className="app-wrapper">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />  
      </div>
    </Router>
  );
}

export default App;
