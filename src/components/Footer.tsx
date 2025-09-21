import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__left">
          <p className="sig-line">Tech + swagger.</p>
          <p className="sig-sub">Built with precision, designed with purpose.</p>
        </div>
        <nav className="site-footer__nav">
          <a href="https://www.trichardson.dev" target="_blank" rel="noreferrer">Portfolio</a>
          <a href="https://github.com/Terence-lr" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
