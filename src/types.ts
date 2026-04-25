export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'guppy';
  photoUrl: string;
  maleStock: number;
  femaleStock: number;
  specs: Record<string, string>;
  videoUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Order {
  id: string;
  productId?: string;
  productName?: string;
  price?: number;
  items?: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    totalPrice: number;
    gender: 'male' | 'female';
  }[];
  totalPrice?: number;
  customerUid?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhoto?: string;
  phone: string;
  telegram?: string;
  paymentMethod: string;
  address: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  isArchived?: boolean;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
}
