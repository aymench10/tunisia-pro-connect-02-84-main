
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, User, Clock, ArrowRight, Verified, Zap, Laptop } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  id: string;
  providerId?: string; // Add provider ID for linking to provider profile
  title: string; // This will be the provider's name
  description: string;
  category?: string;
  location?: string;
  rating?: number | null;
  profilePhoto?: string | null;
  servicePhoto?: string | null; // Added for service photos
  icon?: React.ReactNode;
  price?: string;
  businessName?: string; // Optional business name to show separately
  serviceType?: 'onsite' | 'online'; // New prop for service type
}

const ServiceCard = ({ 
  id, 
  providerId,
  title, 
  description, 
  category, 
  location, 
  rating, 
  profilePhoto,
  servicePhoto, 
  icon, 
  price,
  businessName,
  serviceType 
}: ServiceCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 rounded-3xl">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Image Section */}
        <div className="relative overflow-hidden">
          {/* Premium Badges */}
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold">
              <Zap className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold">
              <Star className="w-3 h-3 mr-1 fill-current" />
              FEATURED
            </Badge>
          </div>

          {/* Service Type Badge */}
          {serviceType && (
            <div className="absolute bottom-4 left-4 z-20">
              <Badge 
                className={`backdrop-blur-sm border-0 shadow-lg px-3 py-1.5 text-xs font-semibold ${
                  serviceType === 'onsite' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                }`}
              >
                {serviceType === 'onsite' ? (
                  <>
                    <MapPin className="w-3 h-3 mr-1" />
                    📍 On-site
                  </>
                ) : (
                  <>
                    <Laptop className="w-3 h-3 mr-1" />
                    💻 Online
                  </>
                )}
              </Badge>
            </div>
          )}

          {/* Profile/Service Photo */}
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {profilePhoto || servicePhoto ? (
              <img 
                src={profilePhoto || servicePhoto || ""}
                alt={`${title} service`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSAxMiAxNUMxNiAxNSAyMSAxNi4zMyAyMSAxOVoiIGZpbGw9IiNjY2MiLz4KPC9zdmc+";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                <User className="w-16 h-16 text-slate-400" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        {/* Content Section */}
        <CardContent className="p-6 relative z-10">
          {/* Provider Name & Rating */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                {title}
              </h3>
              {category && (
                <p className="text-blue-600 font-medium text-sm mb-2 flex items-center gap-1">
                  <Verified className="w-4 h-4" />
                  {category}
                </p>
              )}
            </div>
            
            {rating !== undefined && rating !== null && rating > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span className="font-bold text-sm text-amber-700">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* Price */}
          {price && (
            <div className="mb-4">
              <p className="text-slate-700 font-medium text-sm">
                Starting from{" "}
                <span className="font-bold text-lg text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {price}
                </span>
              </p>
            </div>
          )}
          
          {/* Same-day Service Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-xs">Same-day available</span>
            </div>
          </div>
          
          {/* Action Button */}
          <Link to={providerId ? `/provider/${providerId}` : '#'} className="block" onClick={(e) => {
            if (!providerId) {
              e.preventDefault();
              console.error('No provider ID available for service:', id, title);
              alert('Provider information not available');
            }
          }}>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group/btn"
            >
              <span className="flex items-center justify-center gap-2">
                View Details
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </span>
            </Button>
          </Link>
        </CardContent>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
