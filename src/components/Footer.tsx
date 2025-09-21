import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-var(--panel) border-t border-var(--border) mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-var(--muted) text-sm">
              Tech + swagger.
            </p>
            <p className="text-var(--muted) text-xs mt-1">
              Built with precision, designed with purpose.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://terence-lr.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-var(--muted) hover:text-var(--accent) transition-colors link-underline"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/Terence-lr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-var(--muted) hover:text-var(--accent) transition-colors link-underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
