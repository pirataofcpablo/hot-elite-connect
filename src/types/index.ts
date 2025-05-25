
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'model' | 'user';
  profileImage?: string;
  description?: string;
  pixKey?: string;
  mercadoPagoEmail?: string;
  contactNumber?: string;
  createdAt: Date;
}

export interface Content {
  id: string;
  modelId: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  mediaFiles: string[];
  mediaType: 'image' | 'video' | 'both';
  createdAt: Date;
  isActive: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  modelId: string;
  amount: number;
  paymentProof?: string;
  status: 'pending' | 'approved' | 'rejected';
  expiresAt?: Date;
  createdAt: Date;
}

export interface Model extends User {
  userType: 'model';
  monthlyPrice: number;
  coverImage?: string;
  totalContent: number;
  totalEarnings: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ContentAccess {
  userId: string;
  modelId: string;
  hasAccess: boolean;
  expiresAt?: Date;
}
