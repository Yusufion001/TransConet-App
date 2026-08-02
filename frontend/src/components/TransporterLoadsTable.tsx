import React from 'react';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { MapPin, Truck, Calendar, DollarSign, ChevronRight } from 'lucide-react';

interface Load {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  pickupDate: string;
  price: string;
  status: string;
}

interface TransporterLoadsTableProps {
  loads?: Load[];
  onNavigateMatcher: () => void;
}

export const TransporterLoadsTable: React.FC<TransporterLoadsTableProps> = ({ loads, onNavigateMatcher }) => {
  if (!loads || loads.length === 0) {
    return (
      <EmptyState 
        title="No Active Loads Found"
        description="Your dashboard is currently clear. Head over to the Express Matcher to browse available cargo matching your vehicle capacity and route preferences."
        actionLabel="Find Loads on Matcher"
        onAction={onNavigateMatcher}
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
          <tr>
            <th className="p-4 rounded-tl-2xl">Load ID & Cargo</th>
            <th className="p-4">Route</th>
            <th className="p-4">Pickup Date</th>
            <th className="p-4">Price</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right rounded-tr-2xl">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loads.map((load) => (
            <tr key={load.id} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
              <td className="p-4">
                <div className="font-bold text-slate-800 dark:text-slate-400">{load.id}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Truck size={12} /> {load.cargoType} • {load.weight}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  {load.origin}
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 font-medium mt-1">
                  <MapPin size={12} className="text-emerald-500 ml-0.5" />
                  {load.destination}
                </div>
              </td>
              <td className="p-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400 dark:text-slate-400" />
                  {load.pickupDate}
                </div>
              </td>
              <td className="p-4">
                <div className="font-bold text-slate-800 dark:text-slate-400 flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-600" />
                  {load.price}
                </div>
              </td>
              <td className="p-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  load.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                  load.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                  'bg-brand-50 text-brand-600 border-brand-200'
                }`}>
                  {load.status}
                </span>
              </td>
              <td className="p-4 text-right">
                <Button aria-label="View Details" className="p-2 text-slate-400 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg transition-colors">
                  <ChevronRight size={18} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
