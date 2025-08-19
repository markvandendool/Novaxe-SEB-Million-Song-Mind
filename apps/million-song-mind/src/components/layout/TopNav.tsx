import React from 'react';
import { Link } from 'react-router-dom';

const TopNav: React.FC = () => {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-lg  font-bold text-foreground hover:text-primary transition-colors"
          >
            MillionSongMind
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              to="/braid-classic" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Braid
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;