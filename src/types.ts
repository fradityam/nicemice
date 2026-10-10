export interface Template {
  id: string;
  name: string;
  /** Shown in the homepage catalog. Hidden templates keep their /template/... page. */
  visible: boolean;
  subtitle: string;
  code: string;
  category: 'film' | 'minimalist' | 'floral' | 'modern' | 'vintage';
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
