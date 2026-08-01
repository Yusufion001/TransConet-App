// src/types.ts

export interface LoadPost {
  id: string;
  shipper_id: string;
  origin_state: string;       // One of the 36 Nigerian states
  destination_state: string;  // One of the 36 Nigerian states
  load_type: 'General Cargo' | 'Liquid Bulk' | 'Dry Bulk' | 'Temperature Controlled' | 'Containerized' | 'Heavy Machinery' | 'Vehicles'; 
  weight_tons: number;
  status: 'AVAILABLE' | 'MATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  created_at: string;
}

export interface Post {
  id: string;
  author: string;
  role?: string;
  text: string;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  mediaUrl?: string | null;
  likes: number;
  createdAt?: string;
}
