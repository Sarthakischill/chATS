"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  FileIcon,
  MenuIcon,
  UserIcon,
  LogOut
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function HomeHeader() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollY } = useScroll();
  
  // Transform values for header animations
  const headerOpacity = useTransform(scrollY, [0, 100], [0.5, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [6, 12]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      const progress = Math.min(offset / 200, 1);
      setScrollProgress(progress);
      
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };
  
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href) {
      router.push(href);
    }
  };

  return (
    <motion.header 
      className="fixed top-0 z-50 w-full border-b border-primary/50 transition-all duration-300 h-16 font-bricolage"
      style={{ 
        backgroundColor: useTransform(scrollY, [0, 100], ['rgba(var(--background-rgb), 0.6)', 'rgba(var(--background-rgb), 0.75)']),
        backdropFilter: `blur(12px)`,
        WebkitBackdropFilter: `blur(12px)`
      }}
    >
      <div 
        className="container max-w-[1400px] mx-auto px-6 h-full flex items-center"
        style={{ 
          transformOrigin: 'center top'
        }}
      >
        <Link 
          href="/" 
          className="mr-auto transition-all duration-300"
          onClick={handleNavigation('/')}
        >
          <motion.span 
            className="font-bold text-primary transition-all duration-300 text-xl font-bricolage"
            style={{ opacity: useTransform(scrollY, [0, 100], [1, 0.9]) }}
          >
            chATS
          </motion.span>
        </Link>
        
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-10 font-bricolage">
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === "/dashboard" ? "text-primary" : "text-foreground/80"
            }`}
            onClick={handleNavigation('/dashboard')}
          >
            Dashboard
          </Link>
          <Link 
            href="/analyze" 
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === "/analyze" ? "text-primary" : "text-foreground/80"
            }`}
            onClick={handleNavigation('/analyze')}
          >
            Resume
          </Link>
          <Link 
            href="/cover-letter" 
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === "/cover-letter" ? "text-primary" : "text-foreground/80"
            }`}
            onClick={handleNavigation('/cover-letter')}
          >
            Cover Letter
          </Link>
          <Link 
            href="/learning" 
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === "/learning" ? "text-primary" : "text-foreground/80"
            }`}
            onClick={handleNavigation('/learning')}
          >
            Learning
          </Link>
          <Link 
            href="/chat" 
            className={`text-sm font-medium hover:text-primary transition-colors ${
              pathname === "/chat" ? "text-primary" : "text-foreground/80"
            }`}
            onClick={handleNavigation('/chat')}
          >
            Chat
          </Link>
        </nav>
        
        <div className="flex items-center ml-auto space-x-4">
          <ThemeToggle />
          
          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-accent hover:text-accent-foreground">
                      <UserIcon className="h-4 w-4" />
                      <span className="sr-only">User Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.email && (
                          <p className="font-medium">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" onClick={handleNavigation('/profile')}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" onClick={handleNavigation('/settings')}>Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login" onClick={handleNavigation('/login')}>Login</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/signup" onClick={handleNavigation('/signup')}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-accent hover:text-accent-foreground">
                <MenuIcon className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analyze" onClick={handleNavigation('/analyze')}>Resume</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cover-letter" onClick={handleNavigation('/cover-letter')}>Cover Letter</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/learning" onClick={handleNavigation('/learning')}>Learning</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat" onClick={handleNavigation('/chat')}>Chat</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" onClick={handleNavigation('/profile')}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={handleNavigation('/settings')}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" onClick={handleNavigation('/login')}>Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" onClick={handleNavigation('/signup')}>Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
} 