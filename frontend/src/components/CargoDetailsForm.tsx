import React, { useState } from 'react';
import { Package, MapPin, Truck, AlertCircle, UploadCloud, CheckCircle, User, Calendar, FileText, Camera, ShieldCheck, Target, Leaf, Bell, Share2, Factory, Settings, Building2, Apple, FlaskConical, Car, ShoppingCart, Smartphone, File, Pill, MoreHorizontal, Box, AlignJustify, ShoppingBag, Inbox, Archive, Layers, Send, ChevronRight, Weight, Loader2 } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import RouteDistanceCalculator from './RouteDistanceCalculator';
import { createLoadApi } from '../services/loadService';
import api from '../api/client';
import { Button } from './ui/Button';

function OptionCard({ options, selected, onSelect, label }: { options: { label: string, value: string, icon?: React.ReactNode }[], selected: string, onSelect: (value: string) => void, label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === selected);

  return (
    <div className="space-y-3 relative">
      <label className="text-sm font-bold text-slate-800 dark:text-slate-400 flex items-center gap-2">
        {label} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      </label>
      
      <Button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] hover:border-slate-500 transition-colors text-left"
      >
        {selectedOption ? (
           <div className="flex items-center gap-3">
             <span className="text-brand-500">{selectedOption.icon}</span>
             <span className="text-slate-800 dark:text-slate-400 font-medium">{selectedOption.label}</span>
           </div>
        ) : (
           <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">Select {label}...</span>
        )}
        <ChevronRight className={`text-slate-600 dark:text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} size={20} />
      </Button>

      {isOpen && (
        <div className="absolute z-10 top-[calc(100%+0.5rem)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm p-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto overflow-hidden">
          {options.map((opt) => (
            <Button
              type="button"
              key={opt.value}
              onClick={() => { onSelect(opt.value); setIsOpen(false); }}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${selected === opt.value ? 'bg-brand-600/10 border-brand-500 text-brand-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-500'}`}
            >
              <span className={selected === opt.value ? 'text-brand-500' : 'text-emerald-500'}>{opt.icon}</span>
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CargoDetailsForm() {
  const [showPickup, setShowPickup] = useState(true);
  const [showDelivery, setShowDelivery] = useState(true);
  const [calculatedOptions, setCalculatedOptions] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<{
    distanceKm: number;
    durationText: string;
    estimatedCost: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', category: 'GENERAL_MERCHANDISE', weight: '5000', weightUnit: 'kg',
    packaging: '', pickupAddress: 'Apapa Port, Lagos', pickupContact: '', pickupDate: '', deliveryAddress: 'Challenge, Ibadan, Oyo State',
    deliveryContact: '', deliveryDate: '', vehicleType: '', specialHandling: '', value: '',
    insurance: false, instructions: '', emergencyName: '', emergencyPhone: '',
    declaration: false, documents: '', photos: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!formData.pickupAddress || !formData.deliveryAddress) {
      setSubmitError('Please provide both pickup and delivery locations.');
      return;
    }
    
    setIsCalculating(true);
    setIsSubmitting(true);

    const cargoTitle = formData.name || `${formData.category.replace(/_/g, ' ')} (${formData.weight} ${formData.weightUnit})`;
    const budget = routeMetrics?.estimatedCost || 250000;

    // Direct Express API call backed by Prisma & Supabase PostgreSQL
    const response = await createLoadApi({
      title: cargoTitle,
      cargoType: formData.category || 'GENERAL_MERCHANDISE',
      weightKg: Number(formData.weight) || 5000,
      origin: formData.pickupAddress,
      destination: formData.deliveryAddress,
      suggestedBudget: budget,
      isEscrowEnabled: formData.insurance
    });

    setIsCalculating(false);
    setIsSubmitting(false);

    if (response.success) {
      setSubmitSuccess(`Consignment posted successfully to Supabase database! (Load ID: ${response.load?.id || 'Created'})`);
      
      let basePrice = budget;
      let aiReasoning = null;
      let aiMatches = null;
      
      try {
        if (response.load?.id) {
           // Fetch AI optimized price
           const optRes = await api.post(`/loads/${response.load.id}/optimize-price`);
           if (optRes.data) {
              const optData = optRes.data;
              if (optData.optimizedPrice) {
                 basePrice = optData.optimizedPrice;
                 aiReasoning = optData.reasoning;
              }
           }
           
           // Fetch AI auto-matches
           const matchRes = await api.post(`/loads/${response.load.id}/auto-match`);
           if (matchRes.data) {
              const matchData = matchRes.data;
              aiMatches = matchData.matches;
           }
        }
      } catch (err) {
        // console.error('AI optimization failed:', err);
      }
      
      setSubmitSuccess(
         `Consignment posted successfully! (Load ID: ${response.load?.id || 'Created'})` +
         (aiReasoning ? `\nAI Pricing Insight: ${aiReasoning}` : '') +
         (aiMatches && aiMatches.length > 0 ? `\nAI Matched Driver: ${aiMatches[0].driverId} (Score: ${aiMatches[0].matchScore}%)` : '')
      );

      setCalculatedOptions([
        {
          id: 1,
          title: 'Standard Flatbed (Open Body)',
          subtitle: 'Verified Driver • Standard Route',
          price: basePrice,
          insurance: false
        },
        {
          id: 2,
          title: 'Covered Truck (Box Body)',
          subtitle: 'With GiT Insurance (+₦20,000)',
          price: basePrice + 20000,
          insurance: true
        },
        {
          id: 3,
          title: 'Refrigerated Truck (Cold Chain)',
          subtitle: 'Premium Protection & GiT Insured',
          price: basePrice + 70000,
          insurance: true
        }
      ]);
    } else {
      // Fallback simulation if network or API fails
      let basePrice = budget;
      setSubmitSuccess('Consignment calculated successfully (Offline/Fallback mode).');
      setCalculatedOptions([
        {
          id: 1,
          title: 'Standard Flatbed (Open Body)',
          subtitle: 'Verified Driver • Standard Route',
          price: basePrice,
          insurance: false
        },
        {
          id: 2,
          title: 'Covered Truck (Weatherproof)',
          subtitle: 'Premium Protection • Top Rated',
          price: Math.round(basePrice * 1.15),
          insurance: true
        },
        {
          id: 3,
          title: 'Express Direct Freight',
          subtitle: 'Priority Dispatch • Insured',
          price: Math.round(basePrice * 1.35),
          insurance: true
        }
      ]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 p-4 md:p-8 space-y-6 max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-serif font-black italic tracking-tighter">
            <span className="text-black">Trans</span><span className="text-brand-600">Conet</span>
          </h1>
          <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12}/> All cargo protected. Every mile matters.</p>
        </div>
        <div className="flex gap-3">
          <Button aria-label="Action" type="button" className="p-2 bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-800 transition"><Bell className="text-slate-600 dark:text-slate-400" size={18}/></Button>
          <Button aria-label="Action" type="button" className="p-2 bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-800 transition"><Share2 className="text-slate-600 dark:text-slate-400" size={18}/></Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[20px] border border-slate-200 dark:border-slate-700 space-y-8 shadow-sm overflow-hidden">
        {/* Title */}
        <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/30 border border-brand-500/30 flex items-center justify-center">
                <Box className="text-brand-500" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-400">Cargo Details</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Provide accurate information for better matches</p>
            </div>
        </div>
        
        {/* Cargo Name */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-400 flex items-center gap-2">
            Cargo Name <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </label>
          <div className="relative">
            <input name="name" placeholder="Enter cargo name" onChange={handleChange} className="w-full bg-white dark:bg-slate-900 p-4 pr-12 rounded-[20px] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" required />
            <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/70" size={20} />
          </div>
        </div>

        {/* Category */}
        <OptionCard 
          label="Category"
          options={[
            {label: 'Agriculture', value: 'AGRICULTURAL_GOODS', icon: <Leaf size={18}/>},
            {label: 'Construction', value: 'CONSTRUCTION_MATERIALS', icon: <Building2 size={18}/>},
            {label: 'General Merchandise', value: 'GENERAL_MERCHANDISE', icon: <ShoppingCart size={18}/>},
            {label: 'Pharmaceuticals', value: 'PHARMACEUTICALS_MEDICAL', icon: <Pill size={18}/>},
            {label: 'Electronics', value: 'ELECTRONICS_APPLIANCES', icon: <Smartphone size={18}/>},
            {label: 'Petroleum/Chemicals', value: 'PETROLEUM_CHEMICALS', icon: <FlaskConical size={18}/>},
            {label: 'Heavy Machinery', value: 'HEAVY_MACHINERY', icon: <Factory size={18}/>}
          ]}
          selected={formData.category}
          onSelect={(val) => handleSelect('category', val)}
        />
        
        {/* Cargo Description */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-400 flex items-center gap-2">
            Cargo Description <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </label>
          <div className="relative">
            <textarea name="description" placeholder="Describe your cargo in detail" onChange={handleChange} className="w-full bg-white dark:bg-slate-900 p-4 pr-12 rounded-[20px] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-400 min-h-[120px] focus:outline-none focus:border-emerald-500/50 transition-colors" required />
            <FileText className="absolute right-4 bottom-4 text-emerald-500/70" size={20} />
          </div>
        </div>

        {/* Total Weight */}
        <div className="space-y-3">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-400 flex items-center gap-2">
              Total Weight ({formData.weightUnit}) <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </label>
            <div className="relative flex items-center">
              <input type="number" name="weight" placeholder="Enter total weight" onChange={handleChange} className="w-full bg-white dark:bg-slate-900 p-4 pr-24 rounded-[20px] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" required />
              <div className="absolute right-4 flex items-center gap-2">
                 <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="bg-transparent text-slate-600 dark:text-slate-400 outline-none text-sm cursor-pointer">
                    <option value="kg" className="bg-slate-900">kg</option>
                    <option value="tons" className="bg-slate-900">tons</option>
                    <option value="g" className="bg-slate-900">g</option>
                 </select>
                 <Weight className="text-emerald-500/70" size={18} />
              </div>
            </div>
        </div>

        {/* Packaging Type */}
        <OptionCard 
          label="Packaging"
          options={[
            {label: 'Boxes', value: 'boxes', icon: <Box size={18}/>}, 
            {label: 'Pallets', value: 'pallets', icon: <AlignJustify size={18}/>}, 
            {label: 'Bags', value: 'bags', icon: <ShoppingBag size={18}/>},
            {label: 'Crates', value: 'crates', icon: <Inbox size={18}/>},
            {label: 'Drums', value: 'drums', icon: <Archive size={18}/>},
            {label: 'Others', value: 'others', icon: <MoreHorizontal size={18}/>}
          ]}
          selected={formData.packaging}
          onSelect={(val) => handleSelect('packaging', val)}
        />

        {/* Pickup Details Card */}
        <div className="space-y-3">
          <Button type="button" onClick={() => setShowPickup(!showPickup)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] hover:border-slate-500 transition-colors text-left">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <MapPin className="text-emerald-500" size={20} />
                  </div>
                  <div>
                      <h3 className="text-slate-800 dark:text-slate-400 font-bold text-sm">Pickup Address (Google Maps Autocomplete)</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Search exact hub, port, city or state across Nigeria</p>
                  </div>
              </div>
              <ChevronRight className={`text-slate-600 dark:text-slate-300 transition-transform ${showPickup ? 'rotate-90' : ''}`} size={20} />
          </Button>
          {showPickup && (
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-[20px] space-y-4">
                <LocationAutocomplete 
                  label="Pickup Location"
                  placeholder="Type pickup city, state or hub (e.g. Apapa Port, Lagos)"
                  value={formData.pickupAddress}
                  onChange={(val) => setFormData(prev => ({ ...prev, pickupAddress: val }))}
                  iconColor="text-emerald-500"
                />
                <div className="grid grid-cols-1 gap-3">
                    <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none focus:border-emerald-500/50" />
                </div>
            </div>
          )}
        </div>
        
        {/* Delivery Details Card */}
        <div className="space-y-3">
          <Button type="button" onClick={() => setShowDelivery(!showDelivery)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] hover:border-slate-500 transition-colors text-left">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-brand-500/10 rounded-xl">
                      <MapPin className="text-brand-500" size={20} />
                  </div>
                  <div>
                      <h3 className="text-slate-800 dark:text-slate-400 font-bold text-sm">Delivery Address (Google Maps Autocomplete)</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Search exact destination location</p>
                  </div>
              </div>
              <ChevronRight className={`text-slate-600 dark:text-slate-300 transition-transform ${showDelivery ? 'rotate-90' : ''}`} size={20} />
          </Button>
          {showDelivery && (
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-[20px] space-y-4">
                <LocationAutocomplete 
                  label="Delivery Location"
                  placeholder="Type delivery destination (e.g. Challenge, Ibadan)"
                  value={formData.deliveryAddress}
                  onChange={(val) => setFormData(prev => ({ ...prev, deliveryAddress: val }))}
                  iconColor="text-brand-500"
                />
                <div className="grid grid-cols-1 gap-3">
                    <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none focus:border-emerald-500/50" />
                </div>
            </div>
          )}
        </div>

        {/* Google Maps Distance Calculator */}
        <RouteDistanceCalculator 
          origin={formData.pickupAddress}
          destination={formData.deliveryAddress}
          weightKg={formData.weight}
          onCalculated={(metrics) => setRouteMetrics(metrics)}
        />

        {submitSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3">
            <CheckCircle className="text-emerald-600 shrink-0" size={20} />
            <span className="whitespace-pre-wrap">{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="text-emerald-500" size={24}/>
            <span className="text-xs text-slate-800 dark:text-slate-400 font-bold text-center">Secure & Verified</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center leading-tight">Your cargo is protected</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700">
            <Target className="text-brand-500" size={24}/>
            <span className="text-xs text-slate-800 dark:text-slate-400 font-bold text-center">Smart Matching</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center leading-tight">Get the best transporters</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700">
            <Leaf className="text-emerald-500" size={24}/>
            <span className="text-xs text-slate-800 dark:text-slate-400 font-bold text-center">Eco Friendly</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center leading-tight">Lower emissions, better future</span>
        </div>
      </div>

      <Button type="submit" className="w-full bg-brand-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all overflow-hidden">
        <Send size={18} /> Post Cargo
      </Button>
      
      <p className="text-center text-emerald-500 text-[11px] flex items-center justify-center gap-1"><CheckCircle size={12}/> Your cargo will be visible to verified transporters</p>
      {/* Calculated Options View */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm flex flex-col items-center gap-4 overflow-hidden">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-800 dark:text-slate-400">Calculating transportation costs...</p>
          </div>
        </div>
      )}

      {calculatedOptions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end md:justify-center p-0 md:p-6">
          <div className="bg-white dark:bg-slate-900 md:rounded-[20px] rounded-t-2xl w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Transport Option</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Based on your pickup and delivery locations.</p>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {calculatedOptions.map(opt => (
                <div key={opt.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-brand-500 hover:shadow-lg cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
                  <div className="flex gap-4 items-center">
                    <div className="bg-brand-50 text-brand-600 p-4 rounded-xl">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{opt.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{opt.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-400 tracking-wider">Estimated Cost</p>
                    <p className="text-2xl font-black text-brand-600">₦{opt.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
              <Button 
                type="button" 
                onClick={() => {
                  setCalculatedOptions([]);
                  alert('Option selected! Proceeding to matching...');
                }} 
                className="bg-slate-200 text-slate-700 dark:text-slate-400 hover:bg-slate-300 font-bold px-6 py-3 rounded-xl transition"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

