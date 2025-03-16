import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features: {
    included: boolean;
    text: string;
  }[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  isPopular = false,
  ctaText,
  ctaLink
}: PricingTierProps) => (
  <div className={`flex-1 max-w-md mx-auto lg:mx-0 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 relative ${isPopular ? 'border-primary-200 shadow-lg' : 'border-neutral-200'}`}>
    {isPopular && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="bg-green-500 text-white text-sm font-medium px-4 py-1 rounded-full">Most Popular</span>
      </div>
    )}
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-neutral-800 mb-4">{title}</h3>
      <div className="flex items-baseline mb-6">
        <span className="text-4xl font-bold text-neutral-900">{price}</span>
        <span className="text-neutral-500 ml-2">/month per technician</span>
      </div>
      
      <p className="text-neutral-600 mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-neutral-300 mr-2 mt-0.5" />
            )}
            <span className={feature.included ? '' : 'text-neutral-400'}>{feature.text}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={isPopular ? "default" : "outline"} 
        className="w-full"
        asChild
      >
        <a href={ctaLink}>{ctaText}</a>
      </Button>
    </div>
  </div>
);

const PricingSection = () => {
  const pricingTiers = [
    {
      title: "Standard",
      price: "$29",
      description: "Perfect for small teams and individual technicians who need reliable remote access.",
      features: [
        { included: true, text: "Unlimited remote sessions" },
        { included: true, text: "File transfer & chat" },
        { included: true, text: "Session recording" },
        { included: true, text: "Basic reporting" },
        { included: false, text: "White labeling" },
      ],
      ctaText: "Get Started",
      ctaLink: "#",
      isPopular: false
    },
    {
      title: "Professional",
      price: "$79",
      description: "Advanced features for IT teams that need powerful remote support capabilities.",
      features: [
        { included: true, text: "Everything in Standard" },
        { included: true, text: "White labeling" },
        { included: true, text: "Advanced reporting & analytics" },
        { included: true, text: "Multi-monitor support" },
        { included: true, text: "Priority support" },
      ],
      ctaText: "Get Started",
      ctaLink: "#",
      isPopular: true
    },
    {
      title: "Enterprise",
      price: "$199",
      description: "Complete solution for large organizations with advanced security needs.",
      features: [
        { included: true, text: "Everything in Professional" },
        { included: true, text: "Advanced security & compliance" },
        { included: true, text: "Custom integration options" },
        { included: true, text: "Dedicated account manager" },
        { included: true, text: "24/7 premium support" },
      ],
      ctaText: "Contact Sales",
      ctaLink: "#",
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4 text-center">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-neutral-500 mb-12 max-w-3xl mx-auto text-center">
          Choose the plan that works best for your business needs with no hidden fees.
        </p>
        
        <div className="flex flex-col lg:flex-row justify-center gap-8 mt-8">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              title={tier.title}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              isPopular={tier.isPopular}
              ctaText={tier.ctaText}
              ctaLink={tier.ctaLink}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
