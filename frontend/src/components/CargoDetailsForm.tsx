import React, { useState } from 'react';
import { Package, MapPin, Truck, AlertCircle, UploadCloud, CheckCircle, User, Calendar, FileText, Camera, ShieldCheck, Target, Leaf, Bell, Share2, Factory, Settings, Building2, Apple, FlaskConical, Car, ShoppingCart, Smartphone, File, Pill, MoreHorizontal, Box, AlignJustify, ShoppingBag, Inbox, Archive, Layers, Send, ChevronRight, Weight, Loader2 } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { createLoadApi } from '../services/loadService';
import api from '../api/client';
import { Button } from './ui/Button';

function OptionCard({ options, selected, onSelect, label }: { options: { label: string, value: string, icon?: React.ReactNode }[], selected: string, onSelect: (value: string) => void, label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === selected);

  return (
    <div className="space-y-3 relative">
      <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
        {label} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      </label>
      <Button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[20px] hover:border-slate-400 transition-colors text-left">
        {selectedOption ? (
          <div className="flex items-center gap-3"><span className="text-brand-600">{selectedOption.icon}</span><span className="text-slate-800 font-medium">{selectedOption.label}</span></div>
        ) : <span className="text-slate-600 font-medium text-sm">Select {label}...</span>}
        <ChevronRight className={`text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} size={20} />
      </Button>
      {isOpen && (
        <div className="absolute z-10 top-[calc(100%+0.5rem)] left-0 w-full bg-white border border-slate-200 rounded-[20px] shadow-sm p-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto overflow-hidden">
          {options.map((opt) => (
            <Button type="button" key={opt.value} onClick={() => { onSelect(opt.value); setIsOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${selected === opt.value ? 'bg-white border-brand-500 text-brand-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
              <span className={selected === opt.value ? 'text-brand-600' : 'text-emerald-500'}>{opt.icon}</span>{opt.label}
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
  const [selectedTransportOption, setSelectedTransportOption] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', category: 'GENERAL_MERCHANDISE', weight: '5000', weightUnit: 'kg',
    packaging: '', pickupAddress: 'Apapa Port, Lagos', pickupContact: '', pickupDate: '', deliveryAddress: 'Challenge, Ibadan, Oyo State',
    deliveryContact: '', deliveryDate: '', vehicleType: '', specialHandling: '', value: '', insurance: false, instructions: '', emergencyName: '', emergencyPhone: '',
    declaration: false, documents: '', photos: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitSuccess(null); setSubmitError(null);
    if (!formData.pickupAddress || !formData.deliveryAddress) { setSubmitError('Please provide both pickup and delivery locations.'); return; }
    setIsCalculating(true); setIsSubmitting(true);
    const cargoTitle = formData.name || `${formData.category.replace(/_/g, ' ')} (${formData.weight} ${formData.weightUnit})`;
    const budget = 250000;
    const response = await createLoadApi({ title: cargoTitle, cargoType: formData.category || 'GENERAL_MERCHANDISE', weightKg: Number(formData.weight) || 5000, origin: formData.pickupAddress, destination: formData.deliveryAddress, suggestedBudget: budget, isEscrowEnabled: formData.insurance });
    setIsCalculating(false); setIsSubmitting(false);
    if (response.success) {
      setSubmitSuccess(`Consignment posted successfully to Supabase database! (Load ID: ${response.load?.id || 'Created'})`);
      let basePrice = budget; let aiReasoning = null; let aiMatches = null;
      try {
        if (response.load?.id) {
          const optRes = await api.post(`/loads/${response.load.id}/optimize-price`);
          if (optRes.data) { const optData = optRes.data; if (optData.optimizedPrice) { basePrice = optData.optimizedPrice; aiReasoning = optData.reasoning; } }
          const matchRes = await api.post(`/loads/${response.load.id}/auto-match`);
          if (matchRes.data) { const matchData = matchRes.data; aiMatches = matchData.matches; }
        }
      } catch (err) {}
      setSubmitSuccess(`Consignment posted successfully! (Load ID: ${response.load?.id || 'Created'})` + (aiReasoning ? `\nAI Pricing Insight: ${aiReasoning}` : '') + (aiMatches && aiMatches.length > 0 ? `\nAI Matched Driver: ${aiMatches[0].driverId} (Score: ${aiMatches[0].matchScore}%)` : ''));
      setCalculatedOptions([
        { id: 1, title: 'Standard Flatbed (Open Body)', subtitle: 'Verified Driver • Standard Route', price: basePrice, insurance: false },
        { id: 2, title: 'Covered Truck (Box Body)', subtitle: 'With GiT Insurance (+₦20,000)', price: basePrice + 20000, insurance: true },
        { id: 3, title: 'Refrigerated Truck (Cold Chain)', subtitle: 'Premium Protection & GiT Insured', price: basePrice + 70000, insurance: true }
      ]);
    } else {
      const basePrice = budget; setSubmitSuccess('Consignment calculated successfully (Offline/Fallback mode).');
      setCalculatedOptions([
        { id: 1, title: 'Standard Flatbed (Open Body)', subtitle: 'Verified Driver • Standard Route', price: basePrice, insurance: false },
        { id: 2, title: 'Covered Truck (Weatherproof)', subtitle: 'Premium Protection • Top Rated', price: Math.round(basePrice * 1.15), insurance: true },
        { id: 3, title: 'Express Direct Freight', subtitle: 'Priority Dispatch • Insured', price: Math.round(basePrice * 1.35), insurance: true }
      ]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };
  const handleSelect = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }));

  return (
    <form onSubmit={handleSubmit} className="tc-cargo-form bg-white text-slate-600 p-4 md:p-8 space-y-6 max-w-2xl mx-auto min-h-screen">
      <style>{`
        .tc-cargo-form { font-size: 18px; }
        .tc-cargo-form label { font-size: 18px !important; }
        .tc-cargo-form input, .tc-cargo-form select, .tc-cargo-form textarea { font-size: 21px !important; }
        .tc-cargo-form button { font-size: 21px !important; }
        .tc-cargo-form p { font-size: 18px !important; }
        .tc-cargo-form h2 { font-size: 27px !important; }
        .tc-cargo-form h3 { font-size: 24px !important; }
      `}</style>
      <div className="flex justify-between items-start mb-6"><div><h1 className="text-2xl font-serif font-black italic tracking-tighter"><span className="text-black">Trans</span><span className="text-brand-600">Conet</span></h1><p className="text-emerald-500 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12}/> All cargo protected. Every mile matters.</p></div><div className="flex gap-3"><Button aria-label="Action" type="button" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition"><Bell className="text-slate-600" size={18}/></Button><Button aria-label="Action" type="button" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition"><Share2 className="text-slate-600" size={18}/></Button></div></div>
      <div className="bg-white p-5 md:p-8 rounded-[20px] border border-slate-200 space-y-8 shadow-sm overflow-hidden">
        <div className="flex gap-4 items-center"><div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center"><Box className="text-brand-600" size={24}/></div><div><h2 className="text-xl font-bold text-slate-800">Cargo Details</h2><p className="text-slate-600 text-sm">Provide accurate information for better matches</p></div></div>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center gap-2">Cargo Name <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span></label><div className="relative"><input name="name" placeholder="Enter cargo name" onChange={handleChange} className="w-full bg-white p-4 pr-12 rounded-[20px] border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-colors" required/><Package className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/70" size={20}/></div></div>
        <OptionCard label="Category" options={[{label:'Agriculture',value:'AGRICULTURAL_GOODS',icon:<Leaf size={18}/>},{label:'Construction',value:'CONSTRUCTION_MATERIALS',icon:<Building2 size={18}/>},{label:'General Merchandise',value:'GENERAL_MERCHANDISE',icon:<ShoppingCart size={18}/>},{label:'Pharmaceuticals',value:'PHARMACEUTICALS_MEDICAL',icon:<Pill size={18}/>},{label:'Electronics',value:'ELECTRONICS_APPLIANCES',icon:<Smartphone size={18}/>},{label:'Petroleum/Chemicals',value:'PETROLEUM_CHEMICALS',icon:<FlaskConical size={18}/>},{label:'Heavy Machinery',value:'HEAVY_MACHINERY',icon:<Factory size={18}/>}]} selected={formData.category} onSelect={(val)=>handleSelect('category',val)}/>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center gap-2">Cargo Description <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span></label><div className="relative"><textarea name="description" placeholder="Describe your cargo in detail" onChange={handleChange} className="w-full bg-white p-4 pr-12 rounded-[20px] border border-slate-200 text-slate-800 min-h-[120px] focus:outline-none focus:border-emerald-500/50 transition-colors" required/><FileText className="absolute right-4 bottom-4 text-emerald-500/70" size={20}/></div></div>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center gap-2">Total Weight ({formData.weightUnit}) <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span></label><div className="relative flex items-center"><input type="number" name="weight" placeholder="Enter total weight" onChange={handleChange} className="w-full bg-white p-4 pr-24 rounded-[20px] border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-colors" required/><div className="absolute right-4 flex items-center gap-2"><select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="bg-white text-slate-600 outline-none cursor-pointer"><option value="kg">kg</option><option value="tons">tons</option><option value="g">g</option></select><Weight className="text-emerald-500/70" size={18}/></div></div></div>
        <OptionCard label="Packaging" options={[{label:'Boxes',value:'boxes',icon:<Box size={18}/>},{label:'Pallets',value:'pallets',icon:<AlignJustify size={18}/>},{label:'Bags',value:'bags',icon:<ShoppingBag size={18}/>},{label:'Crates',value:'crates',icon:<Inbox size={18}/>},{label:'Drums',value:'drums',icon:<Archive size={18}/>},{label:'Others',value:'others',icon:<MoreHorizontal size={18}/>}]} selected={formData.packaging} onSelect={(val)=>handleSelect('packaging',val)}/>
        <div className="space-y-3"><Button type="button" onClick={()=>setShowPickup(!showPickup)} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[20px] hover:border-slate-400 transition-colors text-left"><div className="flex items-center gap-4"><div className="p-2 bg-white border border-slate-200 rounded-xl"><MapPin className="text-emerald-500" size={20}/></div><div><h3 className="text-slate-800 font-bold text-sm">Pickup Address</h3><p className="text-slate-600 text-xs">Search exact hub, port, city or state across Nigeria</p></div></div><ChevronRight className={`text-slate-500 transition-transform ${showPickup?'rotate-90':''}`} size={20}/></Button>{showPickup&&<div className="bg-white p-4 border border-slate-200 rounded-[20px] space-y-4"><LocationAutocomplete label="Pickup Location" placeholder="Type pickup city, state or hub (e.g. Apapa Port, Lagos)" value={formData.pickupAddress} onChange={(val)=>setFormData(prev=>({...prev,pickupAddress:val}))} iconColor="text-emerald-500"/><input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full bg-white p-3 rounded-2xl border border-slate-200 text-slate-600 focus:outline-none focus:border-emerald-500/50"/></div>}</div>
        <div className="space-y-3"><Button type="button" onClick={()=>setShowDelivery(!showDelivery)} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[20px] hover:border-slate-400 transition-colors text-left"><div className="flex items-center gap-4"><div className="p-2 bg-white border border-slate-200 rounded-xl"><MapPin className="text-brand-600" size={20}/></div><div><h3 className="text-slate-800 font-bold text-sm">Delivery Address</h3><p className="text-slate-600 text-xs">Search exact destination location</p></div></div><ChevronRight className={`text-slate-500 transition-transform ${showDelivery?'rotate-90':''}`} size={20}/></Button>{showDelivery&&<div className="bg-white p-4 border border-slate-200 rounded-[20px] space-y-4"><LocationAutocomplete label="Delivery Location" placeholder="Type delivery destination (e.g. Challenge, Ibadan)" value={formData.deliveryAddress} onChange={(val)=>setFormData(prev=>({...prev,deliveryAddress:val}))} iconColor="text-brand-600"/><input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full bg-white p-3 rounded-2xl border border-slate-200 text-slate-600 focus:outline-none focus:border-emerald-500/50"/></div>}</div>
        {submitSuccess&&<div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold flex items-center gap-3"><CheckCircle className="text-emerald-600 shrink-0" size={20}/><span className="whitespace-pre-wrap">{submitSuccess}</span></div>}
        {submitError&&<div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 font-bold flex items-center gap-3"><AlertCircle className="text-red-600 shrink-0" size={20}/><span>{submitError}</span></div>}
      </div>
      <Button type="submit" className="w-full bg-white text-brand-600 border border-brand-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all overflow-hidden"><Send size={18}/> Post Cargo</Button>
      <p className="text-center text-emerald-500 flex items-center justify-center gap-1"><CheckCircle size={12}/> Your cargo will be visible to verified transporters</p>
      {isCalculating&&<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col items-center gap-4 overflow-hidden"><div className="w-8 h-8 border-4 border-slate-300 border-t-brand-600 rounded-full animate-spin"></div><p className="font-bold text-slate-800">Posting your cargo...</p></div></div>}
      {calculatedOptions.length > 0&&<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end md:justify-center p-0 md:p-6">
        <div className="bg-white md:rounded-[20px] rounded-t-2xl w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-200"><h2 className="text-2xl font-bold text-slate-900">Select Transport Option</h2><p className="text-slate-500 mt-1">Based on your cargo details.</p></div>
          <div className="p-6 overflow-y-auto space-y-4">
            {calculatedOptions.map(opt=><button key={opt.id} type="button" aria-pressed={selectedTransportOption?.id===opt.id} onClick={()=>setSelectedTransportOption(opt)} className={`w-full text-left border rounded-xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${selectedTransportOption?.id===opt.id?'border-brand-600 bg-white ring-1 ring-brand-500/30':'border-slate-200 hover:border-brand-500 hover:shadow-sm bg-white'}`}>
              <div className="flex gap-4 items-center"><div className={`p-4 rounded-xl border ${selectedTransportOption?.id===opt.id?'bg-white border-brand-600 text-brand-600':'bg-white border-slate-200 text-brand-600'}`}><Truck size={24}/></div><div><h3 className="font-bold text-slate-900 text-lg leading-tight">{opt.title}</h3><p className="text-slate-500 text-sm">{opt.subtitle}</p></div></div>
              <div className="text-left md:text-right"><p className="uppercase font-black text-slate-400 tracking-wider">Estimated Cost</p><p className="text-brand-600 font-black text-2xl">₦{opt.price.toLocaleString()}</p></div>
            </button>)}
          </div>
          <div className="p-6 border-t border-slate-200 bg-white flex justify-between gap-3">
            <Button type="button" onClick={()=>{setCalculatedOptions([]);setSelectedTransportOption(null);}} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition">Cancel</Button>
            <Button type="button" disabled={!selectedTransportOption} onClick={()=>{ if(!selectedTransportOption)return; setFormData(prev=>({...prev,vehicleType:selectedTransportOption.title,insurance:selectedTransportOption.insurance})); setCalculatedOptions([]); setSelectedTransportOption(null); }} className={`font-bold px-6 py-3 rounded-xl transition border ${selectedTransportOption?'bg-white border-brand-600 text-brand-600 hover:bg-slate-50':'bg-white border-slate-300 text-slate-400 cursor-not-allowed'}`}>Use Selected Option</Button>
          </div>
        </div>
      </div>}
    </form>
  );
}
