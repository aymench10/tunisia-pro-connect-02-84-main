import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TunisianStates = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const states = [
    "Ariana", "Ben Arous", "Béja", "Bizerte", "Gabès", "Gafsa", 
    "Jendouba", "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", 
    "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", 
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  const handleStateClick = (state: string) => {
    navigate(`/services?location=${encodeURIComponent(state)}`);
  };
  
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <MapPin className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('serviceCoverage')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {t('availableAcross')}
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"> {t('tunisia')}</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('serviceCoverageDescription')}
          </p>
        </div>
        
        {/* States Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {states.map((state, index) => (
            <Card 
              key={state} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1 rounded-2xl"
              onClick={() => handleStateClick(state)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                {/* High-quality Tunisian Flag */}
                <div className="relative">
                  <div className="w-12 h-8 rounded-lg overflow-hidden shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-300">
                    <svg
                      viewBox="0 0 900 600"
                      className="w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Flag background */}
                      <rect width="900" height="600" fill="#E31B23"/>
                      
                      {/* White circle */}
                      <circle cx="450" cy="300" r="120" fill="white"/>
                      
                      {/* Red circle inside */}
                      <circle cx="450" cy="300" r="96" fill="#E31B23"/>
                      
                      {/* Crescent moon */}
                      <path
                        d="M 410 260 A 50 50 0 1 1 410 340 A 40 40 0 1 0 410 260 Z"
                        fill="white"
                      />
                      
                      {/* Five-pointed star */}
                      <path
                        d="M 470 280 L 476 296 L 492 296 L 479 306 L 485 322 L 470 312 L 455 322 L 461 306 L 448 296 L 464 296 Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-red-500/20 rounded-lg blur-md -z-10 group-hover:bg-red-500/30 transition-colors duration-300"></div>
                </div>
                
                {/* State name */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-red-600 transition-colors duration-300">
                    {state}
                  </h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-4 h-4 text-red-500 mx-auto" />
                  </div>
                </div>
              </CardContent>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-6">
            {t('dontSeeArea')}
          </p>
          <Badge variant="outline" className="px-6 py-2 text-sm border-red-200 text-red-700 hover:bg-red-50 cursor-pointer transition-colors">
            {t('contactForAvailability')}
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default TunisianStates;
