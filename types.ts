import React from 'react';

export enum ViewState {
  GALAXY = 'GALAXY',
  POD_VIEW = 'POD_VIEW',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  USER_LOGIN = 'USER_LOGIN',
  VERIFICATION = 'VERIFICATION',
  DESIGN_STUDIO = 'DESIGN_STUDIO' // Added ViewState
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  color: string;
  category: string;
  geometry: 'box' | 'sphere' | 'cone' | 'torus';
  imageUrl?: string;
  modelUrl?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface PodConfig {
  wallColor: string;
  floorColor: string;
  lightIntensity: number;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  description: string;
  products: Product[];
  coupons: Coupon[];
  campaigns: Campaign[];
  position: [number, number, number];
  podConfig?: PodConfig;
}

export interface VerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  items: Product[];
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  tokens: number;
  cash: number;
  cart: Product[];
  avatarUrl?: string;
  verification: VerificationStatus;
  orders: Order[];
}

export interface Comment {
  id: string;
  brandId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface GlobalComment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

// --- CREATOR ECONOMY TYPES ---
export interface DesignConfig {
  baseColor: string;
  roughness: number;
  metalness: number;
  geometry: 'box' | 'sphere' | 'cone' | 'torus';
  textureUrl?: string; // Added for image mapping
}

export interface UserDesign {
  id: string;
  userId: string;
  username: string;
  name: string;
  description: string;
  price: number; // Asking price for the rights
  config: DesignConfig;
  status: 'DRAFT' | 'FOR_SALE' | 'SOLD';
  createdDate: string;
}

// Global JSX Intrinsic Elements Augmentation for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      torusGeometry: any;
      meshStandardMaterial: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      pointLight: any;
      coneGeometry: any;
      boxGeometry: any;
      primitive: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      color: any;
      fog: any;
      ambientLight: any;
      gridHelper: any;
      capsuleGeometry: any;
      spotLight: any;
    }
  }
}