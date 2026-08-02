import React from 'react';
import { TrendingUp, Download, PieChart, DollarSign, Users, Truck, Activity, CheckCircle, Clock, BarChart3, Star, Zap } from 'lucide-react';
import { Button } from './ui/Button';

export default function AdminAnalytics({ metrics }: { metrics: any }) {
  const handleExport = () => {
    alert("Exporting platform analytics and business report to PDF...");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="text-brand-500" /> Business Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-">Comprehensive overview of platform performance and growth.</p>
        </div>
        <Button onClick={handleExport} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition">
          <Download size={14} /> Export Report
        </Button>
      </div>

      {/* Primary Financial & Volume KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Truck size={16} /></div>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center"><TrendingUp size={10} className="mr-0.5" />+12%</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Total Shipments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalLoads || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Activity size={16} /></div>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center"><TrendingUp size={10} className="mr-0.5" />+8%</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Active Shipments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{Math.floor((metrics?.totalLoads || 0) * 0.35)}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><DollarSign size={16} /></div>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center"><TrendingUp size={10} className="mr-0.5" />+15%</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Escrow Balance</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₦{(metrics?.escrowTotal || 0).toLocaleString()}</p>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><TrendingUp size={16} /></div>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center"><TrendingUp size={10} className="mr-0.5" />+22%</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Platform Revenue</p>
          <p className="text-2xl font-black text-emerald-700">₦{(metrics?.platformEarnings || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Secondary Operational KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Completed Deliveries</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{metrics?.completedLoads || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate- mt-1 font-medium">{metrics?.fulfillmentRate || 0}% Fulfillment Rate</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-brand-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Platform Uptime</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">99.99%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-brand-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">AI Health</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">98%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-pink-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Subscriptions</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            1,240 <span className="text-xs text-emerald-500">+12%</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-amber-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">CSAT Score</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">4.8/5.0</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-brand-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Avg Delivery Time</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">3.2 Days</p>
          <p className="text-[10px] text-emerald-500 mt-1 font-bold">-0.4 Days from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-brand-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Fleet Utilization</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{metrics?.fleetUtilization || 78}%</p>
          <p className="text-[10px] text-emerald-500 mt-1 font-bold">+5% from last month</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-amber-500" />
            <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Customer Satisfaction</p>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{(metrics?.customerSatisfaction || 4.8).toFixed(1)}/5.0</p>
          <p className="text-[10px] text-slate-500 dark:text-slate- mt-1 font-medium">Based on {metrics?.totalRatings ? metrics.totalRatings.toLocaleString() : '1,240'} ratings</p>
        </div>
      </div>

      {/* Growth & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="text-brand-500" size={18} /> Ecosystem Growth
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Customer Growth</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.shippers || 0}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">+18% MoM</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate- font-bold uppercase tracking-wider">Transporter Growth</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.transporters || 0}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">+24% MoM</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="text-amber-500" size={18} /> Top Performing Transporters
          </h3>
          <div className="space-y-3">
            {(metrics?.topTransporters || [
              { name: 'Dangote Logistics', loads: 342, rating: 4.9, revenue: '₦12.5M' },
              { name: 'GUO Transport', loads: 289, rating: 4.8, revenue: '₦9.2M' },
              { name: 'Chisco Haulage', loads: 215, rating: 4.7, revenue: '₦7.8M' },
            ]).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-brand-50 cursor-pointer hover:shadow-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate- flex items-center gap-1">
                      <Star size={10} className="text-amber-500" fill="currentColor" /> {t.rating} • {t.loads} loads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900 dark:text-white">{t.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Monetization & Revenue Streams */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <DollarSign className="text-emerald-500" size={18} /> Revenue Streams & Monetization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Escrow Service Fee</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">1.5% commission on all completed hauls.</p>
            <p className="text-lg font-black text-emerald-600">₦{(metrics?.platformEarnings || 0).toLocaleString()}</p>
          </div>
          
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Subscription Plans</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">Basic, Premium, Enterprise tiers for shippers.</p>
            <p className="text-lg font-black text-brand-600">₦{(metrics?.subscriptionRevenue || 4250000).toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">/mo</span></p>
          </div>
          
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Featured Transporters</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">Sponsored listings & premium visibility.</p>
            <p className="text-lg font-black text-brand-600">₦{(metrics?.featuredTransporterRevenue || 1850000).toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">/mo</span></p>
          </div>
          
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Priority Load Bidding</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">Fees for early access to high-value cargo.</p>
            <p className="text-lg font-black text-amber-600">₦{(metrics?.priorityLoadRevenue || 940000).toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">/mo</span></p>
          </div>
          
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Insurance Partnerships</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">Commission from GiT insurance referrals.</p>
            <p className="text-lg font-black text-brand-600">₦{(metrics?.insuranceRevenue || 2100000).toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">/mo</span></p>
          </div>
          
          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate- text-sm mb-1">Fuel & Maintenance</h4>
            <p className="text-xs text-slate-500 dark:text-slate- mb-3">Affiliate revenue from partner networks.</p>
            <p className="text-lg font-black text-rose-600">₦{(metrics?.fuelMaintenanceRevenue || 650000).toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">/mo</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
