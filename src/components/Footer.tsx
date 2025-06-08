
import { Link } from 'react-router-dom';
import { Youtube, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="text-xl font-bold text-foreground">The Tomorrows Team</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Built with purpose, powered by people. Join our community of bold thinkers improving their communication skills.
            </p>
            <div className="flex space-x-4">
              <a href="https://youtube.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={24} />
              </a>
              <a href="https://instagram.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/join-gd" className="block text-muted-foreground hover:text-primary transition-colors">
                Join a GD
              </Link>
              <Link to="/leaderboard" className="block text-muted-foreground hover:text-primary transition-colors">
                Leaderboard
              </Link>
              <Link to="/watch-learn" className="block text-muted-foreground hover:text-primary transition-colors">
                Watch & Learn
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="space-y-2">
              <Link to="/resources" className="block text-muted-foreground hover:text-primary transition-colors">
                GD Tips
              </Link>
              <Link to="/resources" className="block text-muted-foreground hover:text-primary transition-colors">
                Sample Answers
              </Link>
              <Link to="/resources" className="block text-muted-foreground hover:text-primary transition-colors">
                Interview Prep
              </Link>
              <a href="mailto:contact@tomorrowsteam.com" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 The Tomorrows Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
