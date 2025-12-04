
import { Brand } from './types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-alpha',
    name: 'CYBER WEAR',
    color: '#06b6d4', // Cyan
    description: 'High-tech apparel for the digital nomad.',
    position: [0, 0, 0],
    products: [
      { 
        id: 'p1', 
        name: 'Neon Jacket', 
        price: 150, 
        stock: 50,
        description: 'Glow in the dark thermal jacket.', 
        color: '#06b6d4', 
        category: 'Clothing', 
        geometry: 'box',
        imageUrl: 'https://images.unsplash.com/photo-1551488852-080175d50653?auto=format&fit=crop&w=150&q=80'
      },
      { 
        id: 'p2', 
        name: 'Smart Visor', 
        price: 300, 
        stock: 25,
        description: 'HUD enabled eyewear.', 
        color: '#ec4899', 
        category: 'Accessory', 
        geometry: 'torus',
        imageUrl: 'https://images.unsplash.com/photo-1574315042628-48ae8e4df46f?auto=format&fit=crop&w=150&q=80'
      }
    ],
    coupons: [],
    campaigns: []
  },
  {
    id: 'brand-beta',
    name: 'NEO KICKS',
    color: '#ec4899', // Pink
    description: 'Gravity-defying footwear.',
    position: [10, 5, -10],
    products: [
      { 
        id: 'p3', 
        name: 'Hover Boots', 
        price: 500, 
        stock: 10,
        description: 'Levitation supported boots.', 
        color: '#facc15', 
        category: 'Footwear', 
        geometry: 'cone',
        imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=150&q=80'
      }
    ],
    coupons: [],
    campaigns: []
  },
  {
    id: 'brand-gamma',
    name: 'QUANTUM GEAR',
    color: '#8b5cf6', // Violet
    description: 'Hardware for the next century.',
    position: [-10, -5, -15],
    products: [
      { 
        id: 'p4', 
        name: 'Quantum Core', 
        price: 1200, 
        stock: 5,
        description: 'Portable processing unit.', 
        color: '#10b981', 
        category: 'Tech', 
        geometry: 'sphere',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80'
      },
      { 
        id: 'p5', 
        name: 'Neural Link', 
        price: 2500, 
        stock: 3,
        description: 'Direct brain-computer interface.', 
        color: '#ef4444', 
        category: 'Tech', 
        geometry: 'torus',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80'
      }
    ],
    coupons: [],
    campaigns: []
  },
  {
    id: '123',
    name: 'OMEGA INDUSTRIES',
    color: '#ffffff',
    description: 'Experimental prototype lab.',
    position: [5, 5, 5],
    products: [
      { 
        id: 'p99', 
        name: 'Prototype X', 
        price: 9999, 
        stock: 1,
        description: 'Classified.', 
        color: '#ffffff', 
        category: 'Prototype', 
        geometry: 'sphere',
        imageUrl: 'https://images.unsplash.com/photo-1535378437323-9528f6d92101?auto=format&fit=crop&w=150&q=80'
      }
    ],
    coupons: [],
    campaigns: []
  }
];

export const MOCK_ADMIN_TOKEN = "123";
