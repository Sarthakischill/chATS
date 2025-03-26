"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  FileIcon, 
  MenuIcon 
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-[1200px] mx-auto px-4 h-14 flex items-center">
        <Link href="/" className="mr-8">
          <span className="text-lg font-bold text-primary">
            chATS
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium hover:text-primary transition-colors text-foreground/80"
          >
            Dashboard
          </Link>
          <Link 
            href="/analyze" 
            className="text-sm font-medium hover:text-primary transition-colors text-foreground/80"
          >
            Resume Analyzer
          </Link>
          <Link 
            href="/cover-letter" 
            className="text-sm font-medium hover:text-primary transition-colors text-foreground/80"
          >
            Cover Letter
          </Link>
          <Link 
            href="/chat" 
            className="text-sm font-medium hover:text-primary transition-colors text-foreground/80"
          >
            Chat
          </Link>
        </nav>
        
        <div className="flex items-center ml-auto space-x-4">
          <ThemeToggle />
          
          <div className="hidden md:flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-accent hover:text-accent-foreground">
                <MenuIcon className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analyze">Resume Analyzer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cover-letter">Cover Letter</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat">Chat</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup">Sign Up</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 