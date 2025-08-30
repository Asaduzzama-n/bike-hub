import { IBike, IPartner } from '@/lib/models';
import { BikeData } from '@/lib/api';

// Utility types for form handling
export type BikeFormData = {
  brand: string;
  model: string;
  year: string;
  cc: string;
  buyPrice: string;
  sellPrice: string;
  mileage: string;
  condition: string;
  description: string;
  documents: Document[];
  freeWash: boolean;
  repairs: Repair[];
  partners: Partner[];
  images: string[];
};

export type Document = {
  type: string;
  url: string;
};

export type Repair = {
  description: string;
  cost: string;
  date: string;
};

export type Partner = {
  name: string;
  investment: string;
};

export type LocalBike = IBike & {
  id: string;
  holdDuration?: number;
};

// Converter functions
export const convertApiBikeToLocal = (apiBike: BikeData): LocalBike => {
  return {
    _id: apiBike._id as any,
    brand: apiBike.brand,
    model: apiBike.model,
    year: apiBike.year,
    cc: apiBike.cc,
    mileage: apiBike.mileage,
    buyPrice: apiBike.buyPrice || 0,
    sellPrice: apiBike.sellPrice,
    profit: (apiBike.sellPrice - (apiBike.buyPrice || 0)),
    description: apiBike.description || '',
    images: apiBike.images,
    status: apiBike.status,
    condition: apiBike.condition,
    freeWash: apiBike.freeWash,
    documents: apiBike.documents?.map(doc => ({ type: doc.type, url: doc.url })) || [],
    repairs: [],
    partnerInvestments: [],
    listedDate: new Date(apiBike.listedDate),
    soldDate: apiBike.soldDate ? new Date(apiBike.soldDate) : undefined,
    buyerInfo: apiBike.buyerInfo,
    createdAt: new Date(apiBike.createdAt),
    updatedAt: new Date(apiBike.updatedAt),
    id: apiBike._id,
    holdDuration: apiBike.listedDate ? 
      Math.floor((new Date().getTime() - new Date(apiBike.listedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
  };
};

export const convertLocalBikeToForm = (bike: LocalBike): BikeFormData => {
  return {
    brand: bike.brand,
    model: bike.model,
    year: bike.year.toString(),
    cc: bike.cc.toString(),
    buyPrice: bike.buyPrice.toString(),
    sellPrice: bike.sellPrice.toString(),
    mileage: bike.mileage.toString(),
    condition: bike.condition,
    description: bike.description || '',
    documents: bike.documents?.map(doc => ({ type: doc.type, url: doc.url })) || [],
    freeWash: bike.freeWash,
    repairs: bike.repairs?.map((r) => ({ 
      description: r.description, 
      cost: typeof r.cost === 'number' ? r.cost.toString() : r.cost, 
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date 
    })) || [],
    partners: bike.partnerInvestments?.map((p) => ({ 
      name: `Partner ${p.partnerId}`, 
      investment: p.amount.toString() 
    })) || [],
    images: bike.images,
  };
};

export const convertFormToApiData = (formData: BikeFormData) => {
  const imageUrl = formData.images[0];
  return {
    brand: formData.brand,
    model: formData.model,
    year: parseInt(formData.year),
    cc: parseInt(formData.cc),
    mileage: parseInt(formData.mileage),
    buyPrice: parseFloat(formData.buyPrice),
    sellPrice: parseFloat(formData.sellPrice),
    description: formData.description,
    condition: formData.condition as 'excellent' | 'good' | 'fair' | 'poor',
    freeWash: formData.freeWash,
    images: imageUrl && imageUrl !== '/placeholder-bike.jpg' && imageUrl.startsWith('http') ? [imageUrl] : [],
    status: 'available' as const,
  };
};

// Initial form data
export const initialFormData: BikeFormData = {
  brand: "",
  model: "",
  year: "",
  cc: "",
  buyPrice: "",
  sellPrice: "",
  mileage: "",
  condition: "",
  description: "",
  documents: [],
  freeWash: false,
  repairs: [],
  partners: [],
  images: [],
};

export const brands = ["Honda", "Yamaha", "Bajaj", "Hero", "TVS", "Suzuki", "KTM", "Royal Enfield"];