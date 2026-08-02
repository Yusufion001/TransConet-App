import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { Truck, Package, Map, Search, Filter, Navigation, MoreVertical, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/Button';

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  status: 'IDLE' | 'IN_TRANSIT' | 'MAINTENANCE';
  driver: string;
  location: string;
}

interface Load {
  id: string;
  origin: string;
  destination: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
  price: number;
  weight: string;
  shipper: string;
}

const MOCK_FLEET: Vehicle[] = [
  { id: 'VEH-001', plate: 'LSR-123-AB', type: 'Flatbed Trailer', status: 'IN_TRANSIT', driver: 'Samuel Ojo', location: 'Lagos-Ibadan Exp' },
  { id: 'VEH-002', plate: 'KJA-456-XY', type: 'Box Truck', status: 'IDLE', driver: 'Michael K.', location: 'Ikeja, Lagos' },
  { id: 'VEH-003', plate: 'ABJ-789-QW', type: 'Refrigerated', status: 'MAINTENANCE', driver: 'Unassigned', location: 'Abuja Garage' },
];

const MOCK_LOADS: Load[] = [
  { id: 'LD-9021', origin: 'Apapa Port', destination: 'Kano City', status: 'IN_TRANSIT', price: 450000, weight: '15 Tons', shipper: 'Global Freight' },
  { id: 'LD-9022', origin: 'Ikeja Industrial', destination: 'Port Harcourt', status: 'AVAILABLE', price: 320000, weight: '8 Tons', shipper: 'Tech Supply Co' },
  { id: 'LD-9023', origin: 'Onitsha Market', destination: 'Enugu', status: 'DELIVERED', price: 150000, weight: '5 Tons', shipper: 'Trade Hub' },
];

export default function AdminFleetMarketplace() {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'MARKETPLACE'>('FLEET');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fleetData, loading: fleetLoading, error: fleetError, isOffline: fleetOffline, refetch: refetchFleet } = useAdminLiveData<Vehicle[]>({
    endpoint: '/admin/fleet',
    queryKey: 'admin_fleet',
    autoRefreshInterval: 30000,
    mockData: MOCK_FLEET
  });

  const { data: loadsData, loading: loadsLoading, error: loadsError, isOffline: loadsOffline, refetch: refetchLoads } = useAdminLiveData<Load[]>({
    endpoint: '/admin/loads',
    queryKey: 'admin_loads',
    autoRefreshInterval: 30000,
    mockData: MOCK_LOADS
  });

  const fleet = fleetData || [];
  const loads = loadsData || [];


  const getVehicleStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">In Transit</span>;
      case 'IDLE': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate- px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Idle</span>;
      case 'MAINTENANCE': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Maintenance</span>;
      default: return null;
    }
  };

  const getLoadStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Available</span>;
      case 'ASSIGNED': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Assigned</span>;
      case 'IN_TRANSIT': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">In Transit</span>;
      case 'DELIVERED': return <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Delivered</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Map className="text-brand-600" /> Fleet & Marketplace
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Monitor active vehicles and available loads in the marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total Fleet</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1,248</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Navigation size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Active on Duty</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">842</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Available Loads</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">156</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Completed Today</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">312</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('FLEET')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'FLEET' 
                  ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
              }`}
            >
              <Truck size={16} /> Fleet Directory
            </Button>
            <Button
              onClick={() => setActiveTab('MARKETPLACE')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'MARKETPLACE' 
                  ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
              }`}
            >
              <Package size={16} /> Load Marketplace
            </Button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'FLEET' ? "Search vehicles..." : "Search loads..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'FLEET' ? (
            <table className="w-full text-left border-collapse animate-fade-in">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Vehicle ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Plate & Type</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Driver</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Location</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleet.filter(v => v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || v.id.toLowerCase().includes(searchTerm.toLowerCase())).map(vehicle => (
                  <tr key={vehicle.id || vehicle?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate- font-bold">{vehicle.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{vehicle.plate}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-">{vehicle.type}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-">{vehicle.driver}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate- flex items-center gap-1">
                      <Map size={14} className="text-slate-400 dark:text-slate-400" /> {vehicle.location}
                    </td>
                    <td className="p-4">{getVehicleStatusBadge(vehicle.status)}</td>
                    <td className="p-4 text-right">
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse animate-fade-in">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Load ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Route</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Shipper</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Details</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loads.filter(l => l.id.toLowerCase().includes(searchTerm.toLowerCase()) || l.shipper.toLowerCase().includes(searchTerm.toLowerCase())).map(load => (
                  <tr key={load.id || load?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate- font-bold">{load.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{load.origin}</div>
                      <div className="text-xs text-slate-500 dark:text-slate- text-brand-600 flex items-center gap-1">
                        &rarr; {load.destination}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-">{load.shipper}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">₦{load.price.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-">{load.weight}</div>
                    </td>
                    <td className="p-4">{getLoadStatusBadge(load.status)}</td>
                    <td className="p-4 text-right">
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
