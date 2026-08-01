const fs = require('fs');
let code = fs.readFileSync('src/controllers/adminController.ts', 'utf8');

const extraRoutes = `
export const getAdminFleet = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      take: 50,
      include: {
        transporterProfile: {
          include: { user: true }
        }
      }
    });
    
    // Map to expected frontend format
    const fleet = vehicles.map(v => ({
      id: v.id,
      type: v.vehicleType || 'Truck',
      plateNumber: v.registrationNumber,
      owner: v.transporterProfile?.user?.fullName || 'Unknown',
      status: v.status === 'ACTIVE' ? 'AVAILABLE' : (v.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'IN_TRANSIT'),
      location: 'Lagos, Nigeria', // Default for now
      rating: 4.5,
      capacity: v.capacity || '10 Tons'
    }));

    res.json({ success: true, data: fleet });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getAdminLoads = async (req: Request, res: Response) => {
  try {
    const postings = await prisma.loadPosting.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        shipperProfile: {
          include: { user: true }
        }
      }
    });
    
    const loads = postings.map(p => ({
      id: p.id,
      title: p.cargoType,
      origin: p.originLocation,
      destination: p.destinationLocation,
      status: p.status === 'PUBLISHED' ? 'OPEN' : p.status,
      budget: p.suggestedBudget || 0,
      shipper: p.shipperProfile?.user?.fullName || 'Unknown Shipper',
      postedAt: p.createdAt.toISOString()
    }));

    res.json({ success: true, data: loads });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
`;

code += extraRoutes;
fs.writeFileSync('src/controllers/adminController.ts', code);
