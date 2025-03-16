import { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="4" y="4" width="32" height="32" rx="8" fill="currentColor" className="fill-primary" />
      <path d="M12 20H28M20 12V28" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 14L14 26" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
