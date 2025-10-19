import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Service, ServiceWithProvider } from "@/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PostServiceForm } from "@/components/PostServiceForm";
import { usePermissions } from "@/hooks/usePermissions";
import { getServiceType, getOnSiteCategories, getOnlineCategories } from "@/utils/serviceCategories";

const ServiceListings = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [jobCategories, setJobCategories] = useState<Tables<'job_categories'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Set location and service from URL parameters on component mount
  useEffect(() => {
    const locationParam = searchParams.get('location');
    const serviceParam = searchParams.get('service');
    
    if (locationParam) {
      setLocation(locationParam);
    }
    
    if (serviceParam && jobCategories.length > 0) {
      // Find matching category by name
      const matchingCategory = jobCategories.find(cat => 
        cat.name.toLowerCase() === serviceParam.toLowerCase()
      );
      if (matchingCategory) {
        setCategory(matchingCategory.id);
      }
    }
  }, [searchParams, jobCategories]);

  // Fetch service providers and job categories
  const fetchData = useCallback(async () => {
    try {
      // Fetch job categories
      const { data: categories } = await supabase
        .from('job_categories')
        .select('*');
      
      if (categories) {
        setJobCategories(categories);
      }

      // Simple query to avoid relationship issues
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        throw servicesError;
      }

      // Process services to add profile data and photos
      const servicesWithProfiles = await Promise.all((servicesData || []).map(async (service) => {
        let profileData = null;
        
        // Get profile data using user_id directly from service
        const userId = service.user_id;
        
        if (userId) {
          try {
            const { data } = await supabase
              .from("profiles")
              .select("first_name, last_name, profile_photo_url")
              .eq("id", userId)
              .maybeSingle();
            
            profileData = data;
          } catch (error) {
            console.warn("Could not fetch profile for user:", userId);
          }
        }

        // Try to fetch service photo
        let servicePhoto = null;
        try {
          const { data: photoData } = await supabase
            .from("service_images")
            .select("image_url")
            .eq("service_id", service.id)
            .eq("is_primary", true)
            .maybeSingle();
          
          servicePhoto = photoData?.image_url || null;
        } catch (error) {
          console.warn(`Service photo fetch failed for service ${service.id}:`, error);
        }

        // Ensure we always have provider data - fetch from service_providers table
        let providerData = null;
        if (service.service_provider_id) {
          try {
            const { data: spData } = await supabase
              .from("service_providers")
              .select("*")
              .eq("id", service.service_provider_id)
              .single();
            providerData = spData;
          } catch (error) {
            console.warn(`Could not fetch service provider for service ${service.id}`);
          }
        }
        
        // Create fallback provider data if none exists
        if (!providerData) {
          providerData = {
            id: service.service_provider_id || 'unknown',
            user_id: service.user_id,
            business_name: service.business_name || 'Service Provider',
            business_description: null,
            rating: 0,
            total_reviews: 0,
            profile_photo_url: null,
            is_approved: false,
            job_category_id: service.job_category_id
          };
        }

        return {
          ...service,
          service_providers: providerData,
          profiles: profileData,
          servicePhoto,
          // Add computed fields for easier access
          provider_name: profileData?.first_name 
            ? `${profileData.first_name} ${profileData.last_name || ''}`.trim()
            : providerData.business_name || service.business_name || 'Service Provider',
          provider_photo: profileData?.profile_photo_url || providerData.profile_photo_url
        };
      }));

      setServices(servicesWithProfiles as any);
    } catch (error) {
      console.warn('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Set up real-time subscription for new services
  useEffect(() => {
    const channel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'services'
        },
        () => {
          // Refresh services when any change occurs
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Get unique locations from services (memoized)
  const locations = useMemo(
    () => Array.from(new Set(services.map(s => s.location).filter(Boolean))),
    [services]
  );

  // Filter services based on search criteria (memoized for performance)
  const filteredServices = useMemo(() => services.filter((service) => {
    // Always include services, even if service_providers data is missing
    const serviceProvider = service.service_providers;
    
    const matchesCategory = category && category !== "all" ? 
      (serviceProvider?.job_category_id === category || service.job_category_id === category) : true;
    const matchesLocation = location && location !== "all" ? service.location === location : true;
    const matchesAvailability = availability.length === 0 || 
      (availability.includes("verified") && serviceProvider?.is_approved) ||
      (availability.includes("licensed") && serviceProvider?.is_approved);
    
    return matchesCategory && matchesLocation && matchesAvailability;
  }), [services, category, location, availability]);

  // Separate services by type
  const onSiteServices = useMemo(() => 
    filteredServices.filter(service => {
      const category = jobCategories.find(cat => cat.id === service.job_category_id);
      // Use service_type from database if available, fallback to mapping
      if ((category as any)?.service_type) {
        return (category as any).service_type === 'onsite';
      }
      // Fallback to SERVICE_CATEGORIES mapping
      const categoryName = category?.name || '';
      return getServiceType(categoryName) === 'onsite';
    }), [filteredServices, jobCategories]
  );

  const onlineServices = useMemo(() => 
    filteredServices.filter(service => {
      const category = jobCategories.find(cat => cat.id === service.job_category_id);
      // Use service_type from database if available, fallback to mapping
      if ((category as any)?.service_type) {
        return (category as any).service_type === 'online';
      }
      // Fallback to SERVICE_CATEGORIES mapping
      const categoryName = category?.name || '';
      return getServiceType(categoryName) === 'online';
    }), [filteredServices, jobCategories]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <BrowseServices
          services={filteredServices}
          onSiteServices={onSiteServices}
          onlineServices={onlineServices}
          allServices={services}
          jobCategories={jobCategories}
          loading={loading}
          category={category}
          setCategory={setCategory}
          location={location}
          setLocation={setLocation}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          availability={availability}
          setAvailability={setAvailability}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onServiceCreated={fetchData}
        />
      </div>
    </div>
  );
};

interface BrowseServicesProps {
  services: ServiceWithProvider[];
  onSiteServices: ServiceWithProvider[];
  onlineServices: ServiceWithProvider[];
  allServices: ServiceWithProvider[];
  jobCategories: Tables<'job_categories'>[];
  loading: boolean;
  category: string;
  setCategory: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  availability: string[];
  setAvailability: (value: string[]) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onServiceCreated: () => void;
}

const BrowseServices = ({
  services,
  onSiteServices,
  onlineServices,
  allServices,
  jobCategories,
  loading,
  category,
  setCategory,
  location,
  setLocation,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  dialogOpen,
  setDialogOpen,
  onServiceCreated,
}: BrowseServicesProps) => {
  const { permissions } = usePermissions();
  const [activeTab, setActiveTab] = useState<'onsite' | 'online'>('onsite');

  // Filter categories based on active tab
  const filteredCategories = useMemo(() => 
    jobCategories.filter(cat => (cat as any).service_type === activeTab),
    [jobCategories, activeTab]
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Browse Services
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Find Your Perfect
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Service</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Connect with verified professionals across Tunisia for all your service needs
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Enhanced Filters Sidebar */}
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl shadow-blue-500/10 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-xl text-slate-900 mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Filters
                </h2>
                <p className="text-sm text-slate-500">Refine your search</p>
              </div>
              {permissions.canCreateServices && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Post Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="post-service-description">
                    <DialogHeader>
                      <DialogTitle>Post Your Service</DialogTitle>
                      <DialogDescription id="post-service-description">
                        Fill out the form below to create and publish your service listing
                      </DialogDescription>
                    </DialogHeader>
                    <PostServiceForm onSuccess={() => {
                      setDialogOpen(false);
                      onServiceCreated();
                    }} />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 bg-white/80 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl shadow-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl">
                    <SelectItem value="all" className="rounded-lg hover:bg-blue-50">All Categories</SelectItem>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg hover:bg-blue-50">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  Location
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-12 bg-white/80 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl shadow-sm">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl max-h-64">
                    <SelectItem value="all" className="rounded-lg hover:bg-blue-50">All Locations</SelectItem>
                    <SelectItem value="Tunis" className="rounded-lg hover:bg-blue-50">Tunis</SelectItem>
                    <SelectItem value="Ariana" className="rounded-lg hover:bg-blue-50">Ariana</SelectItem>
                    <SelectItem value="Ben Arous" className="rounded-lg hover:bg-blue-50">Ben Arous</SelectItem>
                    <SelectItem value="Manouba" className="rounded-lg hover:bg-blue-50">Manouba</SelectItem>
                    <SelectItem value="Nabeul" className="rounded-lg hover:bg-blue-50">Nabeul</SelectItem>
                    <SelectItem value="Zaghouan" className="rounded-lg hover:bg-blue-50">Zaghouan</SelectItem>
                    <SelectItem value="Bizerte" className="rounded-lg hover:bg-blue-50">Bizerte</SelectItem>
                    <SelectItem value="Béja" className="rounded-lg hover:bg-blue-50">Béja</SelectItem>
                    <SelectItem value="Jendouba" className="rounded-lg hover:bg-blue-50">Jendouba</SelectItem>
                    <SelectItem value="Kef" className="rounded-lg hover:bg-blue-50">Kef</SelectItem>
                    <SelectItem value="Siliana" className="rounded-lg hover:bg-blue-50">Siliana</SelectItem>
                    <SelectItem value="Kairouan" className="rounded-lg hover:bg-blue-50">Kairouan</SelectItem>
                    <SelectItem value="Kasserine" className="rounded-lg hover:bg-blue-50">Kasserine</SelectItem>
                    <SelectItem value="Sidi Bouzid" className="rounded-lg hover:bg-blue-50">Sidi Bouzid</SelectItem>
                    <SelectItem value="Sousse" className="rounded-lg hover:bg-blue-50">Sousse</SelectItem>
                    <SelectItem value="Monastir" className="rounded-lg hover:bg-blue-50">Monastir</SelectItem>
                    <SelectItem value="Mahdia" className="rounded-lg hover:bg-blue-50">Mahdia</SelectItem>
                    <SelectItem value="Sfax" className="rounded-lg hover:bg-blue-50">Sfax</SelectItem>
                    <SelectItem value="Gafsa" className="rounded-lg hover:bg-blue-50">Gafsa</SelectItem>
                    <SelectItem value="Tozeur" className="rounded-lg hover:bg-blue-50">Tozeur</SelectItem>
                    <SelectItem value="Kebili" className="rounded-lg hover:bg-blue-50">Kebili</SelectItem>
                    <SelectItem value="Gabès" className="rounded-lg hover:bg-blue-50">Gabès</SelectItem>
                    <SelectItem value="Medenine" className="rounded-lg hover:bg-blue-50">Medenine</SelectItem>
                    <SelectItem value="Tataouine" className="rounded-lg hover:bg-blue-50">Tataouine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">{services.length} services found</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl text-slate-600 hover:text-blue-600"
                onClick={() => {
                  setCategory("all");
                  setLocation("all");
                  setPriceRange([0]);
                  setAvailability([]);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Service Listings */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-slate-600 text-sm">Loading services...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced Service Type Tabs */}
              <div className="mb-8">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-xl shadow-blue-500/10 max-w-md mx-auto">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('onsite')}
                      className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === 'onsite'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>On-site</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === 'onsite' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {onSiteServices.length}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('online')}
                      className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === 'online'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v10a2 2 0 01-2 2z" />
                        </svg>
                        <span>Online</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === 'online' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {onlineServices.length}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Grid Content */}
              <div className="animate-fade-in">
                {activeTab === 'onsite' && (
                  <section>
                    {onSiteServices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {onSiteServices.map((service, index) => {
                          const providerName = service.profiles && service.profiles.first_name ? 
                            `${service.profiles.first_name} ${service.profiles.last_name || ''}`.trim() : 
                            service.business_name || 'Service Provider';
                          
                          const category = jobCategories.find(cat => cat.id === (service as any).job_category_id)?.name;
                          
                          return (
                            <div
                              key={service.id}
                              className="group animate-fade-in"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <ServiceCard
                                id={service.id}
                                providerId={service.service_providers?.id || service.service_provider_id}
                                title={providerName}
                                description={service.description || 'Professional service provider'}
                                category={category}
                                location={service.location}
                                rating={service.service_providers?.rating}
                                profilePhoto={service.profiles?.profile_photo_url}
                                servicePhoto={(service as any).servicePhoto}
                                price={service.hourly_rate ? `${service.hourly_rate} TND/hour` : undefined}
                                businessName={service.business_name}
                                serviceType="onsite"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No On-Site Services Found</h3>
                        <p className="text-slate-600">Try adjusting your filters to discover more services</p>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'online' && (
                  <section>
                    {onlineServices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {onlineServices.map((service, index) => {
                          const providerName = service.profiles && service.profiles.first_name ? 
                            `${service.profiles.first_name} ${service.profiles.last_name || ''}`.trim() : 
                            service.business_name || 'Service Provider';
                          
                          const category = jobCategories.find(cat => cat.id === (service as any).job_category_id)?.name;
                          
                          return (
                            <div
                              key={service.id}
                              className="group animate-fade-in"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <ServiceCard
                                id={service.id}
                                providerId={service.service_providers?.id || service.service_provider_id}
                                title={providerName}
                                description={service.description || 'Professional service provider'}
                                category={category}
                                location={service.location}
                                rating={service.service_providers?.rating}
                                profilePhoto={service.profiles?.profile_photo_url}
                                servicePhoto={(service as any).servicePhoto}
                                price={service.hourly_rate ? `${service.hourly_rate} TND/hour` : undefined}
                                businessName={service.business_name}
                                serviceType="online"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Online Services Found</h3>
                        <p className="text-slate-600">Try adjusting your filters to discover more services</p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceListings;