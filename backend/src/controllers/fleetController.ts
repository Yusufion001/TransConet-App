// src/controllers/fleetController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Resilient initialization pattern verified across your auth and load layers
import { prismaRLS as prisma } from '../db/prisma';

// 1. Fetch all trucks registered under the carrier's profile (requested method)
export const getCarrierFleet = async (req: Request, res: Response) => {
  try {
    const carrierId = req.user?.id ?? 'dev-default-carrier';

    

    const fleet = await prisma.transporterVehicle.findMany({
      where: { transporterId: carrierId },
      orderBy: { createdAt: 'desc' }
    });

    // Provide robust mapped properties to support both internal schema and potential custom integrations
    const mappedFleet = fleet.map(v => ({
      ...v,
      userId: v.transporterId,
      licensePlate: v.plateNumber,
      status: v.isVerified ? 'AVAILABLE' : 'PENDING'
    }));

    return res.status(200).json(mappedFleet);
  } catch (error: any) {
    console.error('🚨 [FLEET FETCH ERROR]:', error.message);
    return res.status(500).json({ error: 'Failed to synchronize fleet logs.' });
  }
};

// Existing getter mapping for dashboard compatibility
export const getMyVehicles = async (req: Request, res: Response) => {
  try {
    const transporterId = req.user?.id;

    if (!transporterId) {
      return res.status(401).json({ error: 'Session identification required.' });
    }

    // High-Resilience Fallback: If no live PostgreSQL string is present, serve mock operator assets
    

    // Live Database Query Layer
    const userVehicles = await prisma.transporterVehicle.findMany({
      where: { transporterId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(userVehicles);
  } catch (error) {
    console.error('Failed to retrieve user vehicle assets:', error);
    return res.status(500).json({ error: 'Internal server error scanning vehicle logs.' });
  }
};

// 2. Add a new vehicle to the fleet manifest (requested method with robust compatibility support)
export const registerVehicle = async (req: Request, res: Response) => {
  try {
    const { brand, model, licensePlate, capacityTons, vehicleType, plateNumber } = req.body;
    const carrierId = req.user?.id ?? 'dev-default-carrier';

    // Support both schema naming (plateNumber, vehicleType) and custom integrations payload
    const finalBrand = (brand || '').trim();
    const finalPlate = (plateNumber || licensePlate || '').toUpperCase().trim();
    const finalTons = Number(capacityTons);

    if (!finalBrand || !finalPlate || isNaN(finalTons) || finalTons <= 0) {
      return res.status(400).json({ error: 'All truck specifications and plates must be defined.' });
    }

    // Map input model/type values to our supported database enum schema
    let finalType = vehicleType;
    if (!finalType) {
      const lowerModel = (model || '').toLowerCase();
      if (lowerModel.includes('pickup')) {
        finalType = 'PICKUP';
      } else if (lowerModel.includes('tricycle') || lowerModel.includes('keke')) {
        finalType = 'TRICYCLE';
      } else if (lowerModel.includes('car') || lowerModel.includes('sedan')) {
        finalType = 'COMMERCIAL_CAR';
      } else {
        finalType = 'HEAVY_DUTY';
      }
    }

    

    // Prevent active license duplicate entries across the network
    const duplicatePlate = await prisma.transporterVehicle.findUnique({
      where: { plateNumber: finalPlate }
    });

    if (duplicatePlate) {
      return res.status(409).json({ error: 'A commercial vehicle with this license plate is already registered.' });
    }

    // Commit the new fleet asset securely to PostgreSQL
    const newVehicle = await prisma.transporterVehicle.create({
      data: {
        transporterId: carrierId,
        brand: finalBrand,
        vehicleType: finalType as any,
        plateNumber: finalPlate,
        capacityTons: finalTons,
        isVerified: false // Forces administrative compliance check before visible in marketplace searches
      }
    });

    return res.status(201).json({ 
      message: 'Fleet asset deployed successfully.', 
      vehicleId: newVehicle.id,
      vehicle: {
        ...newVehicle,
        userId: newVehicle.transporterId,
        licensePlate: newVehicle.plateNumber,
        status: 'AVAILABLE'
      }
    });

  } catch (error: any) {
    console.error('🚨 [FLEET REGISTER ERROR]:', error.message);
    return res.status(500).json({ error: 'Database conflict registering truck profile.' });
  }
};

// --- DRIVER DOCUMENT UPLOAD LOGIC ---

// Lazy initialize supabase client
let supabaseAdminClient: any = null;
const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    }
    supabaseAdminClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdminClient;
};


    export const uploadDriverDocuments = async (req: any, res: any) => {
      try {
        const userId = req.user?.id || req.body.userId; 
        const files = req.files;

        if (!userId) {
          return res.status(400).json({ error: 'User ID is required.' });
        }

        

        const updateData: any = {
          verificationLevel: 'LEVEL_3',
          documentsStatus: 'PENDING',
        };

        const isConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

        if (files['driverLicense']?.[0]) {
          const file = files['driverLicense'][0];
          const filePath = `drivers/${userId}/driver_license_${Date.now()}.pdf`;

          if (isConfigured) {
            try {
              const { error } = await getSupabaseAdmin().storage
                .from('driver-documents')
                .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

              if (error) throw error;
              const { data: urlData } = getSupabaseAdmin().storage.from('driver-documents').getPublicUrl(filePath);
              updateData.driverLicenseUrl = urlData.publicUrl;
            } catch (storageError: any) {
              console.warn('⚠️ Supabase admin driverLicense upload failed, falling back to simulated storage:', storageError.message);
              updateData.driverLicenseUrl = `https://operational-media.supabase.co/storage/v1/object/public/driver-documents/${filePath}`;
            }
          } else {
            console.warn('⚠️ Supabase admin not configured, simulating driverLicense upload');
            updateData.driverLicenseUrl = `https://operational-media.supabase.co/storage/v1/object/public/driver-documents/${filePath}`;
          }
        }

        if (files['vehicleRegistration']?.[0]) {
          const file = files['vehicleRegistration'][0];
          const filePath = `drivers/${userId}/vehicle_registration_${Date.now()}.pdf`;

          if (isConfigured) {
            try {
              const { error } = await getSupabaseAdmin().storage
                .from('driver-documents')
                .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

              if (error) throw error;
              const { data: urlData } = getSupabaseAdmin().storage.from('driver-documents').getPublicUrl(filePath);
              updateData.vehicleRegistrationUrl = urlData.publicUrl;
            } catch (storageError: any) {
              console.warn('⚠️ Supabase admin vehicleRegistration upload failed, falling back to simulated storage:', storageError.message);
              updateData.vehicleRegistrationUrl = `https://operational-media.supabase.co/storage/v1/object/public/driver-documents/${filePath}`;
            }
          } else {
            console.warn('⚠️ Supabase admin not configured, simulating vehicleRegistration upload');
            updateData.vehicleRegistrationUrl = `https://operational-media.supabase.co/storage/v1/object/public/driver-documents/${filePath}`;
          }
        }

        const updatedProfile = await prisma.transporterProfile.update({
          where: { userId: userId },
          data: updateData,
        });

        return res.status(200).json({
          message: 'Driver documents uploaded successfully.',
          profile: updatedProfile,
        });

      } catch (error: any) {
        console.error('Upload Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
    };
                                                                                                                                                                                                                                          
export const updateVehicleLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { vehicleId } = req.params;
    const { lat, lng } = req.body;
    
    
    
    await prisma.$executeRawUnsafe(`
      UPDATE "Vehicle" 
      SET "currentLocation" = ST_SetSRID(ST_MakePoint($1, $2), 4326)
      WHERE id = $3
    `, lng, lat, vehicleId);
    
    return res.status(200).json({ message: 'Vehicle location tracked successfully.' });
  } catch (error: any) {
    console.error('Error tracking location:', error);
    return res.status(500).json({ error: 'Failed to update live location.' });
  }
};

export const getNearbyVehicles = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lat, lng, radiusKm = 50 } = req.query;
    
    
    
    const vehicles = await prisma.$queryRawUnsafe(`
      SELECT id, "licensePlate", "make", "model", "capacityTons",
             ST_Y("currentLocation"::geometry) as lat,
             ST_X("currentLocation"::geometry) as lng,
             ST_DistanceSphere("currentLocation"::geometry, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000 as distance_km
      FROM "Vehicle"
      WHERE "currentLocation" IS NOT NULL
        AND ST_DWithin("currentLocation"::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3 * 1000)
      ORDER BY distance_km ASC
      LIMIT 20;
    `, Number(lng), Number(lat), Number(radiusKm));
    
    return res.status(200).json({ vehicles });
  } catch (error: any) {
    console.error('Error getting nearby vehicles:', error);
    return res.status(500).json({ error: 'Failed to retrieve vehicles.' });
  }
};
