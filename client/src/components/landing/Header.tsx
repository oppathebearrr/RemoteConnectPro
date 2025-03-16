import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-auto text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">RemoteConnect</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#features" className="border-transparent text-gray-500 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="border-transparent text-gray-500 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Pricing
              </a>
              <a href="#faq" className="border-transparent text-gray-500 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                FAQ
              </a>
              <a href="#contact" className="border-transparent text-gray-500 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Contact
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="mr-2">Admin Panel</Button>
                  </Link>
                )}
                <Link href="/client">
                  <Button variant="outline" className="mr-2">Client App</Button>
                </Link>
                <Link href="/server">
                  <Button variant="outline" className="mr-2">Server App</Button>
                </Link>
                <Button onClick={() => logout()}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Log in</a>
                </Link>
                <Link href="/signup">
                  <Button className="ml-2">Sign up</Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded={mobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <a href="#features" className="text-gray-500 hover:text-primary block pl-3 pr-4 py-2 text-base font-medium" onClick={toggleMobileMenu}>Features</a>
          <a href="#pricing" className="text-gray-500 hover:text-primary block pl-3 pr-4 py-2 text-base font-medium" onClick={toggleMobileMenu}>Pricing</a>
          <a href="#faq" className="text-gray-500 hover:text-primary block pl-3 pr-4 py-2 text-base font-medium" onClick={toggleMobileMenu}>FAQ</a>
          <a href="#contact" className="text-gray-500 hover:text-primary block pl-3 pr-4 py-2 text-base font-medium" onClick={toggleMobileMenu}>Contact</a>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start">Admin Panel</Button>
                  </Link>
                )}
                <Link href="/client">
                  <Button variant="outline" className="w-full justify-start">Client App</Button>
                </Link>
                <Link href="/server">
                  <Button variant="outline" className="w-full justify-start">Server App</Button>
                </Link>
                <Button onClick={() => logout()} className="w-full justify-start">Logout</Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary">Log in</a>
                </Link>
                <Link href="/signup">
                  <Button className="ml-2">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
