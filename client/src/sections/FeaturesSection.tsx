import { 
  Monitor, 
  ShieldCheck, 
  Upload, 
  Calendar, 
  MessageSquare, 
  Database 
} from "lucide-react";

const features = [
  {
    icon: <Monitor className="h-6 w-6 text-primary" />,
    title: "Full Device Control",
    description: "Take complete control of remote devices with keyboard and mouse capabilities, just like you're sitting in front of them."
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "Advanced Security",
    description: "AES-256 encryption for all data transmission, plus robust authentication to ensure only authorized access."
  },
  {
    icon: <Upload className="h-6 w-6 text-primary" />,
    title: "File Transfer",
    description: "Easily transfer files between local and remote devices with drag-and-drop simplicity, without size limitations."
  },
  {
    icon: <Calendar className="h-6 w-6 text-primary" />,
    title: "Session Scheduling",
    description: "Plan maintenance windows and schedule remote access sessions in advance with automated connections."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Integrated Chat",
    description: "Communicate directly with users on remote machines through text, voice, or video chat for better support."
  },
  {
    icon: <Database className="h-6 w-6 text-primary" />,
    title: "White Labeling",
    description: "Customize the application with your company's branding, colors, and logos for a seamless client experience."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4 text-center">
          Powerful Remote Desktop Features
        </h2>
        <p className="text-lg text-neutral-500 mb-12 max-w-3xl mx-auto text-center">
          RemoteConnect provides all the tools you need for seamless remote access and control.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-neutral-100"
            >
              <div className="p-3 bg-primary-50 rounded-lg inline-flex mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
