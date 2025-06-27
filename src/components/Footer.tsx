
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
              <img 
                src="/lovable-uploads/42d05df8-abbe-449d-89f5-9549f7993132.png" 
                alt="The Tomorrows Team" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-foreground">The Tomorrows Team</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Built with purpose, powered by people. Join our community of bold thinkers improving their communication skills.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://youtube.com/@thetomorrowsteam?si=NKxIUwdc3RJNLNuA" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Youtube size={24} />
              </a>
              <a 
                href="https://www.instagram.com/thetomorrowsteam_?igsh=NXhqd3VodXMzcXk1&utm_source=qr" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://www.linkedin.com/company/107558545/admin/dashboard/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
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

          {/* Resources & Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="space-y-2 mb-6">
              <Link to="/resources" className="block text-muted-foreground hover:text-primary transition-colors">
                GD Tips
              </Link>
              <Link to="/blog" className="block text-muted-foreground hover:text-primary transition-colors">
                Blogs
              </Link>
            </div>
            
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Get in Touch
              </Link>
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
