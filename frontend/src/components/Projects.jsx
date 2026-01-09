// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Todo App Fullstack',
      desc: 'React + Vite + Express + MySQL - Gestion tâches complète',
      tech: ['React', 'Node.js', 'MySQL'],
      link: '#'
    },
    {
      id: 2,
      title: 'Portfolio 2025',
      desc: 'SASS Pure + Framer Motion - Design responsive moderne',
      tech: ['React', 'SASS', 'Vite'],
      link: '#'
    },
    {
      id: 3,
      title: 'API REST Pro',
      desc: 'Node.js + Express + JWT Auth + Rate Limiting',
      tech: ['Node.js', 'Express', 'MySQL'],
      link: '#'
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="section-title"
        >
          Mes Projets
        </motion.h2>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="project-card"
            >
              <div className="project-header">
                <h3>{project.title}</h3>
                <a href={project.link} className="project-link">→</a>
              </div>
              
              <p className="project-desc">{project.desc}</p>
              
              <div className="project-tech">
                {project.tech.map((tech, i) => (
                  <span key={i}>{tech}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
