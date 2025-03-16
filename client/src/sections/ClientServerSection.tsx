import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Monitor, ShieldCheck } from "lucide-react";

const ClientServerSection = () => {
  const benefits = [
    {
      title: "Small Client Footprint",
      description: "Our client is less than 20MB and uses minimal system resources, even on older hardware."
    },
    {
      title: "Robust Server Management",
      description: "Control all aspects of your remote connections from a central server with detailed logging."
    },
    {
      title: "Cross-Platform Support",
      description: "Works across Windows, macOS, and Linux with the same consistent experience."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4">
              Simple Client-Server Architecture
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              Our lightweight client and powerful server design ensures seamless connections and minimal resource usage.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary rounded-full p-1 mr-4 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-neutral-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/client">Download Now</Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 rounded-lg mr-4">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Client Application</h3>
                </div>
                <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full">v3.2.1</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-neutral-700 mb-1">Connection ID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="Enter your 9-digit ID" 
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-neutral-400" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-neutral-700 mb-1">Password (optional)</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                    placeholder="Enter session password" 
                  />
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">
                    Connect Now
                  </Button>
                </div>
                
                <div className="flex items-center justify-center text-neutral-500 text-sm pt-2">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  End-to-end encrypted connection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientServerSection;
