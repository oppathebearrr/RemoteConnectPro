import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Server } from "lucide-react";

const CTASection = () => {
  return (
    <section id="download" className="py-16 md:py-24 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Get Started with RemoteConnect Today</h2>
          <p className="text-xl text-primary-50 mb-8">Download our client application and start your free 14-day trial. No credit card required.</p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50" asChild>
              <Link href="/client">
                <FileText className="h-5 w-5 mr-2" />
                Download Client
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-500" asChild>
              <Link href="/admin">
                <Server className="h-5 w-5 mr-2" />
                Download Server
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-center space-x-8 flex-wrap">
            <div className="flex flex-col items-center m-4">
              <div className="text-4xl font-bold">10M+</div>
              <div className="text-primary-50">Downloads</div>
            </div>
            <div className="flex flex-col items-center m-4">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-primary-50">Active Users</div>
            </div>
            <div className="flex flex-col items-center m-4">
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-primary-50">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
