// Shared pricing configuration - single source of truth
// All prices match the main site (Pricing page & Auth page)

export interface PlanConfig {
  id: string;
  name: string;
  nameAr: string;
  level: string;
  levelAr: string;
  subtitle?: string;
  subtitleAr?: string;
  price: { monthly: number; annual: number };
  subjects: string;
  subjectsAr: string;
  features: string[];
  featuresAr: string[];
  option?: string;
  optionAr?: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  popular?: boolean;
}

export const primaireCollegePlans: PlanConfig[] = [
  {
    id: 'college-regional',
    name: "Collège Pack Régional",
    nameAr: "إعدادي - الجهوي",
    level: "Collège",
    levelAr: "الإعدادي",
    subtitle: "3ème année collège - Toutes matières",
    subtitleAr: "الثالثة إعدادي - جميع المواد",
    price: { monthly: 300, annual: 1000 },
    subjects: "Mathématiques | Physique-Chimie | SVT | Français | Anglais | Arabe",
    subjectsAr: "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض | الفرنسية | الإنجليزية | العربية",
    features: [
      "6 séances / semaine",
      "Exercices guidés + devoirs ciblés",
      "Suivi basique tout au long de l'abonnement"
    ],
    featuresAr: [
      "6 حصص / أسبوع",
      "تمارين موجهة + واجبات محددة",
      "متابعة أساسية طول فترة الاشتراك"
    ],
    option: "100 DH / mois pour une seule matière",
    optionAr: "100 درهم / شهر للمادة الواحدة",
    color: "from-teal-600 to-teal-500",
    textColor: "text-teal-600",
    borderColor: "border-teal-500",
    bgColor: "bg-teal-600",
    popular: true
  },
  {
    id: 'primaire',
    name: "6ème année primaire",
    nameAr: "السنة السادسة ابتدائي",
    level: "Primaire",
    levelAr: "الابتدائي",
    subtitle: "6ème année primaire",
    subtitleAr: "السنة السادسة ابتدائي",
    price: { monthly: 150, annual: 500 },
    subjects: "Arabe | Français | Mathématiques",
    subjectsAr: "العربية | الفرنسية | الرياضيات",
    features: [
      "3 séances / semaine",
      "3 heures / séance",
      "Suivi basique tout au long de l'abonnement"
    ],
    featuresAr: [
      "3 حصص / أسبوع",
      "3 ساعات / حصة",
      "متابعة أساسية طول فترة الاشتراك"
    ],
    option: "70 DH / mois pour une seule matière",
    optionAr: "70 درهم / شهر للمادة الواحدة",
    color: "from-primary to-primary/80",
    textColor: "text-primary",
    borderColor: "border-primary",
    bgColor: "bg-primary"
  }
];

export const lyceePlans: PlanConfig[] = [
  {
    id: 'lycee-1bac-jihawi',
    name: "1 Bac Pack Aljihawi",
    nameAr: "1 باك الجهوي",
    level: "Lycée",
    levelAr: "الثانوي",
    subtitle: "1ère Bac - Matières régional",
    subtitleAr: "الأولى باك - مواد الامتحان الجهوي",
    price: { monthly: 250, annual: 1000 },
    subjects: "Français | Géographie | Arabe | Éducation islamique",
    subjectsAr: "الفرنسية | الجغرافيا | العربية | التربية الإسلامية",
    features: [
      "4 séances / semaine",
      "Exercices guidés + devoirs",
      "Suivi basique tout au long de l'abonnement"
    ],
    featuresAr: [
      "4 حصص / أسبوع",
      "تمارين موجهة + فروض",
      "متابعة أساسية طول فترة الاشتراك"
    ],
    option: "100 DH / mois pour une seule matière",
    optionAr: "100 درهم / شهر للمادة الواحدة",
    color: "from-cyan-600 to-cyan-500",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-500",
    bgColor: "bg-cyan-600",
    popular: true
  },
  {
    id: 'lycee-2bac-total',
    name: "2 Bac National Complet",
    nameAr: "2 باك الوطني الكامل",
    level: "Lycée",
    levelAr: "الثانوي",
    subtitle: "2ème Bac - Toutes matières",
    subtitleAr: "الثانية باك - جميع المواد",
    price: { monthly: 350, annual: 1300 },
    subjects: "Mathématiques | Physique-Chimie | SVT | Anglais | Philosophie",
    subjectsAr: "الرياضيات | الفيزياء والكيمياء | علوم الحياة والأرض | الإنجليزية | الفلسفة",
    features: [
      "5 séances / semaine",
      "DS + simulations complètes",
      "Préparation complète au national"
    ],
    featuresAr: [
      "5 حصص / أسبوع",
      "فروض مراقبة + محاكاة كاملة",
      "تحضير شامل للامتحان الوطني"
    ],
    option: "100 DH / mois pour une seule matière",
    optionAr: "100 درهم / شهر للمادة الواحدة",
    color: "from-amber-600 to-amber-500",
    textColor: "text-amber-600",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-600",
    popular: true
  }
];

export interface IndividualPlanConfig {
  id: string;
  name: string;
  nameAr: string;
  level: string;
  levelAr: string;
  subtitle: string;
  subtitleAr: string;
  features: string[];
  featuresAr: string[];
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  popular?: boolean;
}

export const individualPlans: IndividualPlanConfig[] = [
  {
    id: 'particulier-suivi',
    name: "Suivi individuel",
    nameAr: "متابعة فردية",
    level: "Particulier",
    levelAr: "حصص خاصة",
    subtitle: "Cours particuliers",
    subtitleAr: "حصص خاصة",
    features: [
      "Séance individuelle avec le prof",
      "Programme personnalisé",
      "Suivi personnel complet",
      "Flexibilité des horaires"
    ],
    featuresAr: [
      "حصة فردية مع الأستاذ",
      "برنامج مخصص",
      "متابعة شخصية كاملة",
      "مرونة في المواعيد"
    ],
    color: "from-indigo-600 to-indigo-500",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-500",
    bgColor: "bg-indigo-600",
    popular: true
  }
];

export const allPlans = [...primaireCollegePlans, ...lyceePlans];
export const allPlansWithIndividual = [...allPlans, ...individualPlans];

// Labels for display
export const planLabels: Record<string, string> = {
  'primaire': '6ème année primaire',
  'college-regional': 'Collège Pack Régional',
  'lycee-1bac-jihawi': '1 Bac Pack Aljihawi',
  'lycee-2bac-total': '2 Bac National Complet',
  'particulier-suivi': 'Suivi individuel',
};

export const planLabelsAr: Record<string, string> = {
  'primaire': 'السنة السادسة ابتدائي',
  'college-regional': 'إعدادي - الجهوي',
  'lycee-1bac-jihawi': '1 باك الجهوي',
  'lycee-2bac-total': '2 باك الوطني الكامل',
  'particulier-suivi': 'متابعة فردية',
};

// Prices lookup for quick access
export const planPrices: Record<string, { monthly: number; annual: number }> = {
  'primaire': { monthly: 150, annual: 500 },
  'college-regional': { monthly: 300, annual: 1000 },
  'lycee-1bac-jihawi': { monthly: 250, annual: 1000 },
  'lycee-2bac-total': { monthly: 350, annual: 1300 },
  'particulier-suivi': { monthly: 0, annual: 0 },
};

// Get plan by ID
export const getPlanById = (id: string) => allPlansWithIndividual.find(p => p.id === id);
