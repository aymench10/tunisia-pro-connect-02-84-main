import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ServiceProviderProfile from "@/components/ServiceProviderProfile";
import ServiceDetails from "@/components/ServiceDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingCalendar from "@/components/BookingCalendar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";

const ServiceProviderDetails = () => {
  const { providerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const handleAuthRedirect = (action: 'login' | 'signup') => {
    navigate('/auth', { 
      state: { 
        tab: action,
        returnTo: `/provider/${providerId}`,
        message: "Please sign up or log in to book services"
      }
    });
  };

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
    } else {
      toast({
        title: "Invalid Provider",
        description: "No provider ID was provided",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      
      // Fetch service provider details with correct relationship syntax
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select(`
          *,
          profiles (first_name, last_name, profile_photo_url),
          job_categories!service_providers_job_category_id_fkey (id, name, description)
        `)
        .eq('id', providerId)
        .single();

      if (providerError) {
        console.error('Provider fetch error:', providerError);
        throw providerError;
      }

      if (!providerData) {
        console.error('No provider data found for ID:', providerId);
        throw new Error('Provider not found');
      }


      // Fetch services for this provider with enhanced data
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          job_categories!services_job_category_id_fkey (id, name, description),
          service_images (image_url, is_primary)
        `)
        .eq('service_provider_id', providerId)
        .eq('is_active', true);

      if (servicesError) {
        console.warn('Services fetch error:', servicesError);
      }

      // Fetch reviews for this provider (with fallback for missing reviews table)
      let reviewsData = [];
      try {
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (first_name, last_name)
          `)
          .eq('service_provider_id', providerId)
          .order('created_at', { ascending: false });

        if (!reviewsError && reviews) {
          reviewsData = reviews;
        }
      } catch (reviewError) {
        console.warn('Reviews table might not exist:', reviewError);
      }

      setProvider(providerData);
      setServices(servicesData || []);
      setReviews(reviewsData);
      
      // Automatically select the first service if available
      if (servicesData && servicesData.length > 0) {
        setSelectedService(servicesData[0]);
      }
    } catch (error: any) {
      console.error('Error fetching provider data:', error);
      
      // Better error handling based on error type
      let errorMessage = "Failed to load service provider details";
      if (error.message === 'Provider not found') {
        errorMessage = "Service provider not found";
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else if (error.code === 'PGRST116') {
        errorMessage = `Service provider with ID "${providerId}" not found`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Service Provider Not Found</h1>
          <p className="text-gray-600 mt-2">
            The service provider you're looking for doesn't exist or there was a connection error.
          </p>
          <p className="text-sm text-gray-500 mt-1">Provider ID: {providerId}</p>
          <div className="mt-4 space-x-4">
            <Button onClick={() => navigate('/')} variant="default">
              Go Back Home
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingComplete = (booking: { date: Date; time: string; providerId: string }) => {
    const providerName = provider.profiles ? 
      `${provider.profiles.first_name} ${provider.profiles.last_name}` : 
      'Service Provider';
      
    toast({
      title: "Appointment Selected",
      description: `Your appointment with ${providerName} has been set for ${booking.date.toLocaleDateString()} at ${booking.time}`,
    });
    
    // Navigate to booking form with pre-filled data
    navigate("/booking", { 
      state: { 
        providerId: booking.providerId,
        providerName,
        date: booking.date,
        time: booking.time
      } 
    });
  };

  const providerName = provider.profiles ? 
    `${provider.profiles.first_name} ${provider.profiles.last_name}` : 
    'Service Provider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Available for booking
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Provider Card */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {provider.profiles?.profile_photo_url ? (
                      <img 
                        src={provider.profiles.profile_photo_url}
                        alt={providerName}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{providerName}</h1>
                    <p className="text-blue-600 font-medium mb-2">{provider.job_categories?.name || 'Service Professional'}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(provider.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-600 ml-1">
                          {provider.rating?.toFixed(1) || '0.0'} ({provider.total_reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <div className="text-2xl font-bold text-blue-600">5+</div>
                    <div className="text-sm text-slate-600">Years Experience</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-2xl">
                    <div className="text-2xl font-bold text-green-600">{provider.location || 'Monastir'}</div>
                    <div className="text-sm text-slate-600">Location</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-bold text-purple-600">Same Day</div>
                    <div className="text-sm text-slate-600">Available</div>
                  </div>
                </div>

                {/* Service Features */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Service Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Professional service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Same day available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Verified provider</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Quality guaranteed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">About This Service</h4>
                    <p className="text-slate-600 leading-relaxed">
                      {provider.business_description || 'Professional service provider with years of experience. Committed to delivering high-quality services with attention to detail and customer satisfaction.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Photos */}
            {services.length > 0 && services.some(s => s.service_images?.length > 0) && (
              <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Service Photos ({services.reduce((acc, s) => acc + (s.service_images?.length || 0), 0)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.flatMap(service => 
                      service.service_images?.map((image: any, index: number) => (
                        <div key={`${service.id}-${index}`} className="relative group">
                          <img 
                            src={image.image_url}
                            alt={`Service ${index + 1}`}
                            className="w-full h-32 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                          />
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">
                              Primary
                            </div>
                          )}
                        </div>
                      )) || []
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CV/Resume Section */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CV & Resume
                  </CardTitle>
                  {provider.certificate_url && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {provider.certificate_url ? (
                  <div className="space-y-4">
                    {/* CV Preview Card */}
                    <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">Professional CV</h4>
                          <p className="text-sm text-slate-600">View detailed qualifications and experience</p>
                        </div>
                        <Button 
                          onClick={() => window.open(provider.certificate_url, '_blank')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View CV
                        </Button>
                      </div>
                    </div>

                    {/* Professional Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-medium text-blue-900">Education</span>
                        </div>
                        <p className="text-sm text-blue-800">Professional certification verified</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          <span className="font-medium text-green-900">Experience</span>
                        </div>
                        <p className="text-sm text-green-800">5+ years professional experience</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No CV Available</h3>
                    <p className="text-slate-600 mb-4">This provider hasn't uploaded their CV yet.</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Contact provider for more details
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium text-slate-700">Location:</span>
                    </div>
                    <p className="text-slate-600">{provider.location || 'Monastir'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-slate-700">Status:</span>
                    </div>
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span className="font-medium text-slate-700">Description</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {provider.business_description || 'Professional service provider committed to excellence and customer satisfaction.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl sticky top-24">
              <CardHeader className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">Quote Based</div>
                  <p className="text-sm text-slate-600">Contact for pricing</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                    onClick={() => setShowCalendar(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-2xl py-3"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Location</span>
                  <span className="font-medium text-slate-900">{provider.location || 'Monastir'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Experience</span>
                  <span className="font-medium text-slate-900">5 years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Response time</span>
                  <span className="font-medium text-slate-900">Within 2 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Book Appointment</h2>
                <button 
                  onClick={() => setShowCalendar(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <BookingCalendar
                providerId={provider.id}
                providerName={providerName}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderDetails;