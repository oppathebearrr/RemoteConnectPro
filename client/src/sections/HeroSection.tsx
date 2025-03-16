import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary to-primary-700 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 md:pr-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
            Secure Remote Desktop For Any Business
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-50">
            Access any device, anywhere. RemoteConnect provides fast, secure, and reliable remote desktop technology for businesses of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/client">Download Client</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-600 border-2" asChild>
              <Link href="#demo">Request Demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center text-sm">
            <PlayCircle className="h-5 w-5 mr-2" />
            <span>See how it works in 2 minutes</span>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-neutral-800 py-2 px-4 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-white text-sm">Remote Session - Dashboard</div>
              </div>
              <div className="h-[400px] bg-gray-100 flex items-center justify-center">
                <svg 
                  width="400" 
                  height="300" 
                  viewBox="0 0 400 300" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-80"
                >
                  <rect width="400" height="300" fill="#F5F7FA"/>
                  <rect x="40" y="40" width="320" height="40" rx="4" fill="#E4E7EB"/>
                  <rect x="60" y="52" width="120" height="16" rx="2" fill="#9AA5B1"/>
                  <rect x="280" y="52" width="60" height="16" rx="2" fill="#9AA5B1"/>
                  
                  <rect x="40" y="100" width="150" height="160" rx="4" fill="#E4E7EB"/>
                  <rect x="60" y="120" width="110" height="12" rx="2" fill="#9AA5B1"/>
                  <rect x="60" y="144" width="80" height="8" rx="2" fill="#CBD2D9"/>
                  <rect x="60" y="164" width="90" height="8" rx="2" fill="#CBD2D9"/>
                  <rect x="60" y="184" width="70" height="8" rx="2" fill="#CBD2D9"/>
                  <rect x="60" y="220" width="110" height="20" rx="4" fill="#3366FF"/>
                  
                  <rect x="210" y="100" width="150" height="160" rx="4" fill="#E4E7EB"/>
                  <rect x="230" y="120" width="110" height="12" rx="2" fill="#9AA5B1"/>
                  <rect x="230" y="144" width="110" height="60" rx="2" fill="#CBD2D9"/>
                  <rect x="230" y="220" width="110" height="20" rx="4" fill="#CBD2D9"/>
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-lg shadow-lg">
              <div className="text-green-500 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected Securely
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
