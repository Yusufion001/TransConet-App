import React, { useState } from 'react';
import { Package, MapPin, Truck, AlertCircle, CheckCircle, Leaf, Bell, Share2, Factory, Building2, FlaskConical, ShoppingCart, Smartphone, Pill, MoreHorizontal, Box, AlignJustify, ShoppingBag, Inbox, Archive, Send, ChevronRight, Weight } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { createLoadApi } from '../services/loadService';
import api from '../api/client';
import { Button } from './ui/Button';

const ROYAL_BLUE = '#4169E1';

function OptionCard({ options, selected, onSelect, label }: { options: { label: string, value: string, icon?: React.ReactNode }[], selected: string, onSelect: (value: string) => void, label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === selected);
  return (
    <div className="space-y-3 relative">
      <label className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2 text-center">{label} <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }} /></label>
      <Button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-[20px] transition-colors text-center" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        {selectedOption ? <div className="flex items-center justify-center gap-3"><span style={{ color: ROYAL_BLUE }}>{selectedOption.icon}</span><span className="text-slate-800 font-medium">{selectedOption.label}</span></div> : <span className="font-medium text-sm" style={{ color: ROYAL_BLUE }}>Select {label}...</span>}
        <ChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} style={{ color: ROYAL_BLUE }} size={20} />
      </Button>
      {isOpen && <div className="absolute z-10 top-[calc(100%+0.5rem)] left-0 w-full bg-white rounded-[20px] shadow-sm p-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto overflow-hidden" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        {options.map(opt => <Button type="button" key={opt.value} onClick={() => { onSelect(opt.value); setIsOpen(false); }} className="flex items-center justify-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all bg-white" style={{ borderColor: selected === opt.value ? ROYAL_BLUE : '#B7C6F5', color: selected === opt.value ? ROYAL_BLUE : '#475569' }}><span style={{ color: ROYAL_BLUE }}>{opt.icon}</span>{opt.label}</Button>)}
      </div>}
    </div>
  );
}

export default function CargoDetailsForm() {
  const [step, setStep] = useState<1 | 2>(1);
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
    deliveryContact: '', deliveryDate: '', vehicleType: '', specialHandling: '', value: '', insurance: false, instructions: '', emergencyName: '', emergencyPhone: '', declaration: false, documents: '', photos: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };
  const handleSelect = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }));

  const continueToStepTwo = () => {
    setSubmitError(null);
    if (!formData.name.trim()) { setSubmitError('Please enter a cargo name.'); return; }
    if (!formData.description.trim()) { setSubmitError('Please describe your cargo.'); return; }
    if (!formData.weight || Number(formData.weight) <= 0) { setSubmitError('Please enter a valid cargo weight.'); return; }
    if (!formData.packaging) { setSubmitError('Please select packaging.'); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitSuccess(null); setSubmitError(null);
    if (!formData.pickupAddress || !formData.deliveryAddress) { setSubmitError('Please provide both pickup and delivery locations.'); return; }
    setIsCalculating(true); setIsSubmitting(true);
    const cargoTitle = formData.name || `${formData.category.replace(/_/g, ' ')} (${formData.weight} ${formData.weightUnit})`;
    const budget = 250000;
    const response = await createLoadApi({ title: cargoTitle, cargoType: formData.category || 'GENERAL_MERCHANDISE', weightKg: Number(formData.weight) || 5000, origin: formData.pickupAddress, destination: formData.deliveryAddress, suggestedBudget: budget, isEscrowEnabled: formData.insurance });
    setIsCalculating(false); setIsSubmitting(false);
    if (response.success) {
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

  return (
    <form onSubmit={handleSubmit} className="tc-cargo-form bg-white text-slate-600 p-4 md:p-8 space-y-6 max-w-2xl mx-auto min-h-screen">
      <style>{`
        .tc-cargo-form { font-size: 18px; --tc-royal-blue: #4169E1; }
        .tc-cargo-form label { font-size: 18px !important; }
        .tc-cargo-form input, .tc-cargo-form select, .tc-cargo-form textarea { font-size: 21px !important; border-color: var(--tc-royal-blue) !important; }
        .tc-cargo-form button { font-size: 21px !important; }
        .tc-cargo-form p { font-size: 18px !important; }
        .tc-cargo-form h2 { font-size: 27px !important; }
        .tc-cargo-form h3 { font-size: 24px !important; }
        .tc-cargo-form input:focus, .tc-cargo-form select:focus, .tc-cargo-form textarea:focus { border-color: var(--tc-royal-blue) !important; box-shadow: 0 0 0 2px rgba(65,105,225,.14); }
      `}</style>
      <div className="flex justify-between items-start mb-6"><div><h1 className="text-2xl font-serif font-black italic tracking-tighter"><span className="text-black">Trans</span><span className="text-brand-600">Conet</span></h1><p className="text-emerald-500 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12}/> All cargo protected. Every mile matters.</p></div><div className="flex gap-3"><Button aria-label="Action" type="button" className="p-2 bg-white rounded-full transition" style={{ border: `1px solid ${ROYAL_BLUE}`, color: ROYAL_BLUE }}><Bell size={18}/></Button><Button aria-label="Action" type="button" className="p-2 bg-white rounded-full transition" style={{ border: `1px solid ${ROYAL_BLUE}`, color: ROYAL_BLUE }}><Share2 size={18}/></Button></div></div>

      <div className="flex items-center justify-center gap-3 px-2" aria-label={`Post Cargo step ${step} of 2`}><div className="flex-1 max-w-28 h-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }} /><div className="flex-1 max-w-28 h-1.5 rounded-full" style={{ backgroundColor: step === 2 ? ROYAL_BLUE : '#D9E2FF' }} /></div>
      <div className="text-center"><p className="font-bold" style={{ color: ROYAL_BLUE }}>Step {step} of 2</p><h2 className="text-2xl font-bold text-slate-800">{step === 1 ? 'Cargo Details' : 'Pickup & Delivery'}</h2><p className="text-slate-600 text-sm">{step === 1 ? 'Tell us about the cargo you want to ship.' : 'Tell us where the cargo starts and where it should go.'}</p></div>

      {step === 1 ? <div className="bg-white p-5 md:p-8 rounded-[20px] space-y-8 shadow-sm overflow-hidden" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        <div className="flex gap-4 items-center justify-center text-center"><div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center" style={{ border: `1px solid ${ROYAL_BLUE}` }}><Box style={{ color: ROYAL_BLUE }} size={24}/></div><div><h2 className="text-xl font-bold text-slate-800">Cargo Details</h2><p className="text-slate-600 text-sm">Provide accurate information for better matches</p></div></div>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2 text-center">Cargo Name <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }}/></label><div className="relative"><input name="name" value={formData.name} placeholder="Enter cargo name" onChange={handleChange} className="w-full bg-white p-4 pr-12 rounded-[20px] text-slate-800 focus:outline-none transition-colors" required/><Package className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: ROYAL_BLUE }} size={20}/></div></div>
        <OptionCard label="Category" options={[{label:'Agriculture',value:'AGRICULTURAL_GOODS',icon:<Leaf size={18}/>},{label:'Construction',value:'CONSTRUCTION_MATERIALS',icon:<Building2 size={18}/>},{label:'General Merchandise',value:'GENERAL_MERCHANDISE',icon:<ShoppingCart size={18}/>},{label:'Pharmaceuticals',value:'PHARMACEUTICALS_MEDICAL',icon:<Pill size={18}/>},{label:'Electronics',value:'ELECTRONICS_APPLIANCES',icon:<Smartphone size={18}/>},{label:'Petroleum/Chemicals',value:'PETROLEUM_CHEMICALS',icon:<FlaskConical size={18}/>},{label:'Heavy Machinery',value:'HEAVY_MACHINERY',icon:<Factory size={18}/>}]} selected={formData.category} onSelect={(val)=>handleSelect('category',val)}/>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2 text-center">Cargo Description <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }}/></label><div className="relative"><textarea name="description" value={formData.description} placeholder="Describe your cargo in detail" onChange={handleChange} className="w-full bg-white p-4 rounded-[20px] text-slate-800 min-h-[120px] focus:outline-none transition-colors" required/></div></div>
        <div className="space-y-3"><label className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2 text-center">Total Weight ({formData.weightUnit}) <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }}/></label><div className="relative flex items-center"><input type="number" name="weight" value={formData.weight} placeholder="Enter total weight" onChange={handleChange} className="w-full bg-white p-4 pr-24 rounded-[20px] text-slate-800 focus:outline-none transition-colors" required/><div className="absolute right-4 flex items-center gap-2"><select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="bg-white outline-none cursor-pointer"><option value="kg">kg</option><option value="tons">tons</option><option value="g">g</option></select><Weight style={{ color: ROYAL_BLUE }} size={18}/></div></div></div>
        <OptionCard label="Packaging" options={[{label:'Boxes',value:'boxes',icon:<Box size={18}/>},{label:'Pallets',value:'pallets',icon:<AlignJustify size={18}/>},{label:'Bags',value:'bags',icon:<ShoppingBag size={18}/>},{label:'Crates',value:'crates',icon:<Inbox size={18}/>},{label:'Drums',value:'drums',icon:<Archive size={18}/>},{label:'Others',value:'others',icon:<MoreHorizontal size={18}/>}]} selected={formData.packaging} onSelect={(val)=>handleSelect('packaging',val)}/>
        {submitError&&<div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 font-bold flex items-center gap-3"><AlertCircle className="text-red-600 shrink-0" size={20}/><span>{submitError}</span></div>}
        <Button type="button" onClick={continueToStepTwo} className="w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: ROYAL_BLUE, color:'#FFFFFF', border:`1px solid ${ROYAL_BLUE}` }}>Continue <ChevronRight size={18}/></Button>
      </div> : <div className="bg-white p-5 md:p-8 rounded-[20px] space-y-8 shadow-sm overflow-hidden" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        <div className="flex gap-4 items-center justify-center text-center"><div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center" style={{ border: `1px solid ${ROYAL_BLUE}` }}><MapPin style={{ color: ROYAL_BLUE }} size={24}/></div><div><h2 className="text-xl font-bold text-slate-800">Pickup & Delivery</h2><p className="text-slate-600 text-sm">Choose the origin and destination for your shipment</p></div></div>
        <div className="space-y-3"><Button type="button" onClick={()=>setShowPickup(!showPickup)} className="w-full flex items-center justify-center gap-4 p-4 bg-white rounded-[20px] transition-colors text-center" style={{ border: `1px solid ${ROYAL_BLUE}` }}><div className="flex items-center justify-center gap-4"><div className="p-2 bg-white rounded-xl" style={{ border: `1px solid ${ROYAL_BLUE}` }}><MapPin style={{ color: ROYAL_BLUE }} size={20}/></div><h3 className="text-slate-800 font-bold text-sm">Pickup Address</h3></div><ChevronRight className={`transition-transform ${showPickup?'rotate-90':''}`} style={{ color: ROYAL_BLUE }} size={20}/></Button>{showPickup&&<div className="p-4 rounded-[20px] space-y-4" style={{ backgroundColor:'#F8FAFF' }}><LocationAutocomplete label="Pickup Location" placeholder="Type pickup city, state or hub" value={formData.pickupAddress} onChange={(val)=>setFormData(prev=>({...prev,pickupAddress:val}))} iconColor="text-blue-600"/><input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full bg-white p-3 rounded-2xl text-slate-600 focus:outline-none"/></div>}</div>
        <div className="space-y-3"><Button type="button" onClick={()=>setShowDelivery(!showDelivery)} className="w-full flex items-center justify-center gap-4 p-4 bg-white rounded-[20px] transition-colors text-center" style={{ border: `1px solid ${ROYAL_BLUE}` }}><div className="flex items-center justify-center gap-4"><div className="p-2 bg-white rounded-xl" style={{ border: `1px solid ${ROYAL_BLUE}` }}><MapPin style={{ color: ROYAL_BLUE }} size={20}/></div><h3 className="text-slate-800 font-bold text-sm">Delivery Address</h3></div><ChevronRight className={`transition-transform ${showDelivery?'rotate-90':''}`} style={{ color: ROYAL_BLUE }} size={20}/></Button>{showDelivery&&<div className="p-4 rounded-[20px] space-y-4" style={{ backgroundColor:'#F8FAFF' }}><LocationAutocomplete label="Delivery Location" placeholder="Type delivery destination" value={formData.deliveryAddress} onChange={(val)=>setFormData(prev=>({...prev,deliveryAddress:val}))} iconColor="text-blue-600"/><input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full bg-white p-3 rounded-2xl text-slate-600 focus:outline-none"/></div>}</div>
        {submitSuccess&&<div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold flex items-center gap-3"><CheckCircle className="text-emerald-600 shrink-0" size={20}/><span className="whitespace-pre-wrap">{submitSuccess}</span></div>}
        {submitError&&<div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 font-bold flex items-center gap-3"><AlertCircle className="text-red-600 shrink-0" size={20}/><span>{submitError}</span></div>}
        <div className="flex gap-3"><Button type="button" onClick={()=>{setSubmitError(null);setStep(1);window.scrollTo({top:0,behavior:'smooth'});}} className="flex-1 font-bold py-4 rounded-2xl" style={{ backgroundColor:'#fff', color:ROYAL_BLUE, border:`1px solid ${ROYAL_BLUE}` }}>Back</Button><Button type="submit" disabled={isSubmitting} className="flex-[2] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all" style={{ backgroundColor:ROYAL_BLUE, color:'#fff', border:`1px solid ${ROYAL_BLUE}` }}><Send size={18}/>{isSubmitting?'Posting...':'Post Cargo'}</Button></div>
        <p className="text-center flex items-center justify-center gap-1" style={{ color:ROYAL_BLUE }}><CheckCircle size={12}/> Your cargo will be visible to verified transporters</p>
      </div>}

      {isCalculating&&<div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col items-center gap-4 overflow-hidden"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor:'#D9E2FF', borderTopColor:ROYAL_BLUE }}/><p className="font-bold text-slate-800">Posting your cargo...</p></div></div>}
      {calculatedOptions.length > 0&&<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end md:justify-center p-0 md:p-6"><div className="bg-white md:rounded-[20px] rounded-t-2xl w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]"><div className="p-6 border-b" style={{borderColor:ROYAL_BLUE}}><h2 className="text-2xl font-bold text-slate-900">Select Transport Option</h2><p className="text-slate-500 mt-1">Based on your cargo details.</p></div><div className="p-6 overflow-y-auto space-y-4">{calculatedOptions.map(opt=><button key={opt.id} type="button" aria-pressed={selectedTransportOption?.id===opt.id} onClick={()=>setSelectedTransportOption(opt)} className={`w-full text-left border rounded-xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden cursor-pointer focus:outline-none ${selectedTransportOption?.id===opt.id?'bg-white ring-1':'bg-white'}`} style={{borderColor:selectedTransportOption?.id===opt.id?ROYAL_BLUE:'#B7C6F5',...(selectedTransportOption?.id===opt.id?{boxShadow:'0 0 0 2px rgba(65,105,225,.15)'}:{})}}><div className="flex gap-4 items-center"><div className="p-4 rounded-xl border" style={{borderColor:ROYAL_BLUE,color:ROYAL_BLUE}}><Truck size={24}/></div><div><h3 className="font-bold text-slate-900 text-lg leading-tight">{opt.title}</h3><p className="text-slate-500 text-sm">{opt.subtitle}</p></div></div><div className="text-left md:text-right"><p className="uppercase font-black text-slate-400 tracking-wider">Estimated Cost</p><p className="font-black text-2xl" style={{color:ROYAL_BLUE}}>₦{opt.price.toLocaleString()}</p></div></button>)}</div><div className="p-6 border-t bg-white flex justify-between gap-3" style={{borderColor:ROYAL_BLUE}}><Button type="button" onClick={()=>{setCalculatedOptions([]);setSelectedTransportOption(null);}} className="bg-white font-bold px-6 py-3 rounded-xl transition" style={{border:`1px solid ${ROYAL_BLUE}`,color:ROYAL_BLUE}}>Cancel</Button><Button type="button" disabled={!selectedTransportOption} onClick={()=>{if(!selectedTransportOption)return;setFormData(prev=>({...prev,vehicleType:selectedTransportOption.title,insurance:selectedTransportOption.insurance}));setCalculatedOptions([]);setSelectedTransportOption(null);}} className="font-bold px-6 py-3 rounded-xl transition border" style={{backgroundColor:selectedTransportOption?ROYAL_BLUE:'#F1F5F9',borderColor:selectedTransportOption?ROYAL_BLUE:'#CBD5E1',color:selectedTransportOption?'#FFFFFF':'#94A3B8'}}>Use Selected Option</Button></div></div></div>}
    </form>
  );
}
