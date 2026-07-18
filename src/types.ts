export interface Template {
  id: string;
  name: string;
  subtitle: string;
  code: string;
  category: 'minimalist' | 'floral' | 'modern' | 'vintage';
  bgColor: string;
  textColor: string;
  borderColor?: string;
  italicText?: string;
  previewType: 'card' | 'floral-panel' | 'record' | 'circular' | 'grid';
  details: {
    husband: string;
    wife: string;
    date: string;
    location: string;
    quote?: string;
    accentColor?: string;
  };
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating?: number;
  location?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  readTime: string;
}

export interface JourneyStep {
  timeline: string;
  title: string;
  checklist: string[];
}
