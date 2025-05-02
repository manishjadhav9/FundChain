"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Eye,
  User,
  Gift,
  Trophy,
  Users,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const donorNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Donations', href: '/donations', icon: Wallet },
  { name: 'View Campaigns', href: '/campaigns', icon: Eye },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Redeem Points', href: '/redeem', icon: Gift },
];

const ngoNavigation = [
  { name: 'Dashboard', href: '/ngo-dashboard', icon: LayoutDashboard },
  { name: 'My Campaigns', href: '/ngo-campaigns', icon: Wallet },
  { name: 'View All Campaigns', href: '/campaigns', icon: Eye },
  { name: 'Community', href: '/community', icon: Users },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Wallet },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Verifications', href: '/admin/verifications', icon: Eye },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const getNavigation = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return adminNavigation;
      case 'ngo':
        return ngoNavigation;
      case 'donor':
        return donorNavigation;
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6" />
            <span className="text-xl font-bold">FundChain</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="rounded-lg bg-accent p-4">
            <h3 className="text-sm font-medium">Community Impact</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Join our community to share stories, connect with donors, and make a bigger impact together.
            </p>
          </div>
        </div>
        <div className="border-t p-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder-avatar.png"} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left text-sm font-medium">{user.name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-2">
                <Link href="/auth/signup">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 