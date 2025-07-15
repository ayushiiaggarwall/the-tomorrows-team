
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Calendar, 
  Trophy, 
  BookOpen, 
  User, 
  LogOut 
} from 'lucide-react';

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My GD Schedule', path: '/joinsession', icon: Calendar },
    { name: 'My Rewards', path: '/leaderboard', icon: Trophy },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-4">
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              isActive(item.path)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </Link>
        ))}
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full mt-4"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
