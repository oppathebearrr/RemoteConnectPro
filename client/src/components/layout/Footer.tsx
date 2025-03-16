import { Link } from "wouter";
import Logo from "@/components/icons/Logo";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo className="h-8 w-auto text-white" />
              <span className="ml-2 text-xl font-bold text-white">RemoteConnect</span>
            </div>
            <p className="mb-4">
              Fast, secure remote desktop software for businesses of all sizes.
            </p>
            <p className="text-sm">
              © {new Date().getFullYear()} RemoteConnect. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors duration-200">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a></li>
              <li><Link href="/client" className="hover:text-white transition-colors duration-200">Download</Link></li>
              <li><a href="#features" className="hover:text-white transition-colors duration-200">White Labeling</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Security</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors duration-200">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Partners</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Support Center</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors duration-200">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">System Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Legal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <a href="#" className="text-sm hover:text-white transition-colors duration-200 mr-6">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-white transition-colors duration-200 mr-6">Terms of Service</a>
            <a href="#" className="text-sm hover:text-white transition-colors duration-200">Cookie Policy</a>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
