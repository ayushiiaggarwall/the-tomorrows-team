
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import NotificationBell from '@/components/notifications/NotificationBell';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile to get full name
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      return profile;
    },
    enabled: !!user?.id
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Dynamic navigation items based on auth state
  const navItems = user ? [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About', href: '/about' },
    { name: 'Join GD', href: '/join-gd' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Watch & Learn', href: '/watch-learn' },
    { name: 'Resources', href: '/resources' },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Join GD', href: '/join-gd' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Watch & Learn', href: '/watch-learn' },
    { name: 'Resources', href: '/resources' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/' || href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      const names = userProfile.full_name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      } else if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
    }
    
    // Fallback to email if no full name available
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
              <img 
                src="/lovable-uploads/42d05df8-abbe-449d-89f5-9549f7993132.png" 
                alt="The Tomorrows Team" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-foreground/80 hover:text-foreground px-3 py-2 text-sm font-medium transition-colors relative ${
                  isActiveRoute(item.href) 
                    ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full' 
                    : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Settings className="w-4 h-4 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/login">
                <Button className="btn-primary">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`hover:text-foreground hover:bg-muted block px-3 py-2 text-base font-medium transition-colors ${
                  isActiveRoute(item.href)
                    ? 'text-foreground bg-muted border-l-4 border-primary'
                    : 'text-foreground/80'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="text-foreground/80 hover:text-foreground hover:bg-muted block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="text-foreground/80 hover:text-foreground hover:bg-muted block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-2 inline" />
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-primary hover:text-primary hover:bg-primary/10 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-foreground/80 hover:text-foreground hover:bg-muted block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2 inline" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-foreground/80 hover:text-foreground hover:bg-muted block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
