import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    services: 'الخدمات',
    pricing: 'الأسعار',
    contact: 'اتصل بنا',
    bookings: 'الحجوزات',
    admin: 'الإدارة',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    loginRegister: 'تسجيل الدخول / التسجيل',
    logout: 'تسجيل الخروج',
    
    // Common
    search: 'بحث',
    filter: 'فلتر',
    all: 'الكل',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    
    // Service related
    postService: 'انشر خدمتك',
    findServices: 'ابحث عن الخدمات',
    serviceType: 'نوع الخدمة',
    onSite: 'في الموقع',
    online: 'عبر الإنترنت',
    category: 'الفئة',
    location: 'الموقع',
    
    // Homepage
    popularServices: 'الخدمات الشائعة',
    popularServicesSubtitle: 'اكتشف خدماتنا الأكثر طلباً',
    sameDayService: '✓ خدمة في نفس اليوم متاحة',
    loadingServices: 'جاري تحميل الخدمات...',
    noServicesAvailable: 'لا توجد خدمات متاحة حتى الآن',
    viewAllServices: 'عرض جميع الخدمات',
    
    onlineExperts: 'خبراء عبر الإنترنت والمستقلون',
    onlineExpertsSubtitle: 'تواصل مع المحترفين ذوي الخبرة عبر الإنترنت',
    browseFreelancers: 'تصفح المستقلين',
    
    howItWorks: 'كيف يعمل',
    howItWorksSubtitle: 'خطوات سهلة للحصول على خدمتك',
    step1Title: 'احجز خدمة',
    step1Description: 'اختر الخدمة التي تحتاجها وحدد الوقت المفضل لديك',
    step2Title: 'احصل على مطابقة',
    step2Description: 'سنربطك بمحترف ماهر بالقرب منك',
    step3Title: 'اكتمال الخدمة',
    step3Description: 'يصل المحترف وينجز العمل بما يرضيك',
    
    
    topProfessionals: 'أفضل محترفينا',
    topProfessionalsSubtitle: 'تعرف على بعض مقدمي الخدمات عالي التقييم لدينا',
    jobsCompleted: 'مهمة مكتملة',
    
    readyToStart: 'مستعد للبدء؟',
    readyToStartSubtitle: 'انضم إلى آلاف العملاء الراضين في جميع أنحاء تونس الذين يثقون في ServiGOTN لاحتياجات خدمات منازلهم',
    bookNow: 'احجز الآن',
    joinAsProfessional: 'انضم كمحترف',
    tunisianOwned: 'مملوك ومدار تونسياً',
    paymentMethods: 'الدفع: نقداً | فلوسي',
    
    // Hero section
    heroTitle: 'اعثر على أفضل مقدمي الخدمات في تونس',
    heroSubtitle: 'اكتشف واحجز خدمات عالية الجودة من محترفين معتمدين في منطقتك',
    
    // Pricing
    pricingTitle: 'أسعارنا',
    pricingSubtitle: 'اختر الخطة التي تناسب احتياجاتك وابدأ اليوم',
    
    // Contact
    contactTitle: 'اتصل بنا',
    contactSubtitle: 'نحن هنا لمساعدتك. لا تتردد في الاتصال بنا لأي سؤال أو اقتراح',
    
    // TunisianStates section
    serviceCoverage: 'تغطية الخدمة',
    availableAcross: 'متاح في جميع أنحاء',
    tunisia: 'تونس',
    serviceCoverageDescription: 'خدمات منزلية احترافية يتم تقديمها إلى كل محافظة. اختر موقعك للبدء مع خبراء محليين موثوقين.',
    dontSeeArea: 'لا ترى منطقتك؟ نحن نتوسع بسرعة في جميع أنحاء تونس.',
    contactForAvailability: 'اتصل بنا للاستعلام عن التوفر',
    
    // Logout messages
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    logoutError: 'خطأ في تسجيل الخروج',
    
    // Contact form
    messageSuccess: 'تم إرسال الرسالة بنجاح! سنرد عليك قريباً.',
    messageError: 'خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    hours: 'ساعات العمل',
    responseTime: 'الرد في غضون 24 ساعة',
    workingHours: 'الاثنين-الجمعة 9ص-6م',
    mainOffice: 'المكتب الرئيسي',
    supportAvailable: 'الدعم متاح',
    popularServicesDescription: 'اكتشف محترفينا الأكثر طلباً، متاحين في جميع أنحاء تونس',
    
    // Notifications
    newMessage: 'رسالة جديدة',
    newBookingRequest: 'طلب حجز جديد',
    bookingConfirmed: 'تم تأكيد الحجز',
    bookingUpdate: 'تحديث الحجز',
    paymentSuccessful: 'تم الدفع بنجاح',
    paymentFailed: 'فشل الدفع',
    
    // Hero section features
    fastBooking: 'حجز سريع',
    fastBookingDesc: 'احجز محترفاً في دقائق واحصل على المساعدة عندما تحتاجها أكثر',
    verifiedProfessionals: 'محترفون معتمدون',
    verifiedProfessionalsDesc: 'جميع محترفينا معتمدون ومقيمون من قبل عملاء مثلك',
    transparentPricing: 'أسعار شفافة',
    transparentPricingDesc: 'اعرف التكلفة مقدماً بدون رسوم مخفية أو مفاجآت',
    
    // Trust indicators
    happyCustomers: '10,000+ عميل سعيد',
    averageRating: '4.9/5 متوسط التقييم',
    activeProfessionals: '500+ محترف نشط',
    platformBadge: '#1 منصة خدمات في تونس',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    services: 'Services',
    pricing: 'Tarifs',
    contact: 'Contact',
    bookings: 'Réservations',
    admin: 'Admin',
    profile: 'Profil',
    login: 'Se connecter',
    register: "S'inscrire",
    loginRegister: "Se connecter / S'inscrire",
    logout: 'Se déconnecter',
    
    // Common
    search: 'Rechercher',
    filter: 'Filtres',
    all: 'Tous',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    
    // Service related
    postService: 'Publier votre service',
    findServices: 'Trouver des services',
    serviceType: 'Type de service',
    onSite: 'Sur site',
    online: 'En ligne',
    category: 'Catégorie',
    location: 'Lieu',
    
    // Homepage
    popularServices: 'Services Populaires',
    popularServicesSubtitle: 'Découvrez nos services les plus demandés',
    sameDayService: '✓ Service le jour même disponible',
    loadingServices: 'Chargement des services...',
    noServicesAvailable: 'Aucun service disponible pour le moment',
    viewAllServices: 'Voir tous les services',
    
    onlineExperts: 'Experts en ligne et Freelancers',
    onlineExpertsSubtitle: 'Connectez-vous avec des professionnels expérimentés en ligne',
    browseFreelancers: 'Parcourir les Freelancers',
    
    howItWorks: 'Comment ça fonctionne',
    howItWorksSubtitle: 'Étapes simples pour obtenir votre service',
    step1Title: 'Réserver un service',
    step1Description: 'Choisissez le service dont vous avez besoin et sélectionnez votre créneau préféré',
    step2Title: 'Obtenez une correspondance',
    step2Description: 'Nous vous mettrons en relation avec un professionnel qualifié près de chez vous',
    step3Title: 'Service terminé',
    step3Description: 'Le professionnel arrive et termine le travail à votre satisfaction',
    
    
    topProfessionals: 'Nos meilleurs professionnels',
    topProfessionalsSubtitle: 'Rencontrez quelques-uns de nos prestataires de services les mieux notés',
    jobsCompleted: 'travaux terminés',
    
    readyToStart: 'Prêt à commencer ?',
    readyToStartSubtitle: 'Rejoignez des milliers de clients satisfaits à travers la Tunisie qui font confiance à ServiGOTN pour leurs besoins de services à domicile',
    bookNow: 'Réserver maintenant',
    joinAsProfessional: 'Rejoindre en tant que professionnel',
    tunisianOwned: 'Propriété et exploitation tunisiennes',
    paymentMethods: 'Paiement: Espèces | Flouci',
    
    // Hero section
    heroTitle: 'Trouvez les meilleurs prestataires de services en Tunisie',
    heroSubtitle: 'Découvrez et réservez des services de qualité auprès de professionnels certifiés dans votre région',
    
    // Pricing
    pricingTitle: 'Nos Tarifs',
    pricingSubtitle: 'Choisissez le plan qui correspond à vos besoins et commencez dès aujourd\'hui',
    
    // Contact
    contactTitle: 'Contactez-nous',
    contactSubtitle: 'Nous sommes là pour vous aider. N\'hésitez pas à nous contacter pour toute question ou suggestion',
    
    // TunisianStates section
    serviceCoverage: 'Couverture de Service',
    availableAcross: 'Disponible à travers',
    tunisia: 'la Tunisie',
    serviceCoverageDescription: 'Services à domicile professionnels livrés dans chaque gouvernorat. Choisissez votre emplacement pour commencer avec des experts locaux de confiance.',
    dontSeeArea: 'Vous ne voyez pas votre région ? Nous nous développons rapidement à travers la Tunisie.',
    contactForAvailability: 'Contactez-nous pour la disponibilité',
    
    // Logout messages
    logoutSuccess: 'Vous avez été déconnecté avec succès',
    logoutError: 'Erreur lors de la déconnexion',
    
    // Contact form
    messageSuccess: 'Message envoyé avec succès! Nous vous répondrons bientôt.',
    messageError: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    hours: 'Horaires',
    responseTime: 'Réponse sous 24h',
    workingHours: 'Lun-Ven 9h-18h',
    mainOffice: 'Bureau principal',
    supportAvailable: 'Support disponible',
    popularServicesDescription: 'Découvrez nos professionnels les plus demandés, disponibles dans toute la Tunisie',
    
    // Notifications
    newMessage: 'Nouveau message',
    newBookingRequest: 'Nouvelle demande de réservation',
    bookingConfirmed: 'Réservation confirmée',
    bookingUpdate: 'Mise à jour de la réservation',
    paymentSuccessful: 'Paiement réussi',
    paymentFailed: 'Paiement échoué',
    
    // Hero section features
    fastBooking: 'Réservation Rapide',
    fastBookingDesc: 'Réservez un professionnel en quelques minutes et obtenez de l\'aide quand vous en avez le plus besoin',
    verifiedProfessionals: 'Professionnels Vérifiés',
    verifiedProfessionalsDesc: 'Tous nos professionnels sont vérifiés et évalués par des clients comme vous',
    transparentPricing: 'Tarification Transparente',
    transparentPricingDesc: 'Connaissez le coût à l\'avance sans frais cachés ni surprises',
    
    // Trust indicators
    happyCustomers: '10,000+ Clients Satisfaits',
    averageRating: '4.9/5 Note Moyenne',
    activeProfessionals: '500+ Professionnels Actifs',
    platformBadge: '#1 Plateforme de Services en Tunisie',
  },
  en: {
    // Navigation
    home: 'Home',
    services: 'Services',
    pricing: 'Pricing',
    contact: 'Contact',
    bookings: 'Bookings',
    admin: 'Admin',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    loginRegister: 'Login / Register',
    logout: 'Logout',
    
    // Common
    search: 'Search',
    filter: 'Filters',
    all: 'All',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    
    // Service related
    postService: 'Post Your Service',
    findServices: 'Find Services',
    serviceType: 'Service Type',
    onSite: 'On-site',
    online: 'Online',
    category: 'Category',
    location: 'Location',
    
    // Homepage
    popularServices: 'Popular Services',
    popularServicesSubtitle: 'Discover our most requested services',
    sameDayService: '✓ Same-day service available',
    loadingServices: 'Loading services...',
    noServicesAvailable: 'No services available yet',
    viewAllServices: 'View All Services',
    
    onlineExperts: 'Online Experts & Freelancers',
    onlineExpertsSubtitle: 'Connect with Experienced Online Professionals',
    browseFreelancers: 'Browse Freelancers',
    
    howItWorks: 'How It Works',
    howItWorksSubtitle: 'Easy steps to get your service',
    step1Title: 'Book a Service',
    step1Description: 'Choose the service you need and select your preferred time slot',
    step2Title: 'Get Matched',
    step2Description: "We'll connect you with a skilled professional near you",
    step3Title: 'Service Completed',
    step3Description: 'The professional arrives and completes the job to your satisfaction',
    
    
    topProfessionals: 'Our Top Professionals',
    topProfessionalsSubtitle: 'Meet some of our highly-rated service providers',
    jobsCompleted: 'jobs completed',
    
    readyToStart: 'Ready to get started?',
    readyToStartSubtitle: 'Join thousands of satisfied customers across Tunisia who trust ServiGOTN for their home service needs',
    bookNow: 'Book Now',
    joinAsProfessional: 'Join as a Professional',
    tunisianOwned: 'Tunisian Owned & Operated',
    paymentMethods: 'Payment: Cash | Flouci',
    
    // Hero section
    heroTitle: 'Find the Best Service Providers in Tunisia',
    heroSubtitle: 'Discover and book quality services from certified professionals in your area',
    
    // Pricing
    pricingTitle: 'Our Pricing',
    pricingSubtitle: 'Choose the plan that fits your needs and get started today',
    
    // Contact
    contactTitle: 'Contact Us',
    contactSubtitle: 'We\'re here to help. Feel free to reach out with any questions or suggestions',
    
    // TunisianStates section
    serviceCoverage: 'Service Coverage',
    availableAcross: 'Available Across',
    tunisia: 'Tunisia',
    serviceCoverageDescription: 'Professional home services delivered to every governorate. Choose your location to get started with trusted local experts.',
    dontSeeArea: 'Don\'t see your area? We\'re expanding rapidly across Tunisia.',
    contactForAvailability: 'Contact us for availability',
    
    // Logout messages
    logoutSuccess: 'You have been logged out successfully',
    logoutError: 'Error during logout',
    
    // Contact form
    messageSuccess: 'Message sent successfully! We will respond to you soon.',
    messageError: 'Error sending message. Please try again.',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    hours: 'Hours',
    responseTime: 'Response within 24h',
    workingHours: 'Mon-Fri 9am-6pm',
    mainOffice: 'Main office',
    supportAvailable: 'Support available',
    popularServicesDescription: 'Discover our most in-demand professionals, available throughout Tunisia',
    
    // Notifications
    newMessage: 'New Message',
    newBookingRequest: 'New Booking Request',
    bookingConfirmed: 'Booking Confirmed',
    bookingUpdate: 'Booking Update',
    paymentSuccessful: 'Payment Successful',
    paymentFailed: 'Payment Failed',
    
    // Hero section features
    fastBooking: 'Fast Booking',
    fastBookingDesc: 'Book a professional within minutes and get help when you need it most',
    verifiedProfessionals: 'Verified Professionals',
    verifiedProfessionalsDesc: 'All our professionals are verified and rated by customers like you',
    transparentPricing: 'Transparent Pricing',
    transparentPricingDesc: 'Know the cost upfront with no hidden fees or surprises',
    
    // Trust indicators
    happyCustomers: '10,000+ Happy Customers',
    averageRating: '4.9/5 Average Rating',
    activeProfessionals: '500+ Active Professionals',
    platformBadge: '#1 Service Platform in Tunisia',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('selectedLanguage', lang);
    
    // Update document direction and language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  }, [language]);
  
  const isRTL = language === 'ar';

  // Load saved language on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && ['ar', 'fr', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    } else {
      // Set default direction and language
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};