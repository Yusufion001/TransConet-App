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
      <style>{`\n        .tc-cargo-form { font-size: 18px; --tc-royal-blue: #4169E1; }\n        .tc-cargo-form label { font-size: 18px !important; }\n        .tc-cargo-form input, .tc-cargo-form select, .tc-cargo-form textarea { font-size: 21px !important; border-color: var(--tc-royal-blue) !important; }\n        .tc-cargo-form button { font-size: 21px !important; }\n        .tc-cargo-form input::placeholder, .tc-cargo-form textarea::placeholder { color: #64748b !important; opacity: 1; }\n        .tc-cargo-form input:focus, .tc-cargo-form select:focus, .tc-cargo-form textarea:focus { border-color: var(--tc-royal-blue) !important; box-shadow: 0 0 0 3px rgba(65,105,225,0.15) !important; outline: none; }\n      `}</style>

      {step === 1 ? (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Post Cargo</h1>
          </div>

          {submitError && <div className="rounded-xl p-4 bg-red-50 text-red-700 border border-red-200"><div className="flex items-center gap-2 font-bold"><AlertCircle size={20} /> Please review the form</div><div className="mt-1 whitespace-pre-line">{submitError}</div></div>}
          {submitSuccess && <div className="rounded-xl p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-pre-line">{submitSuccess}</div>}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-visible">
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Cargo Name</label><input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 10 bags of rice" className="w-full px-4 py-3 rounded-xl border bg-white text-slate-900" /></div>
                <OptionCard label="Category" selected={formData.category} onSelect={(v) => handleSelect('category', v)} options={[
                  { value: 'GENERAL_MERCHANDISE', label: 'General Merchandise', icon: <Package size={20} /> },
                  { value: 'FRAGILE', label: 'Fragile Items', icon: <AlertCircle size={20} /> },
                  { value: 'PERISHABLE', label: 'Perishable Goods', icon: <Leaf size={20} /> },
                  { value: 'ELECTRONICS', label: 'Electronics', icon: <Smartphone size={20} /> },
                  { value: 'MEDICAL', label: 'Medical Supplies', icon: <Pill size={20} /> },
                  { value: 'CHEMICALS', label: 'Chemicals', icon: <FlaskConical size={20} /> },
                  { value: 'MACHINERY', label: 'Machinery', icon: <Factory size={20} /> },
                  { value: 'AUTOMOTIVE', label: 'Automotive Parts', icon: <Truck size={20} /> },
                  { value: 'CONSTRUCTION', label: 'Construction Materials', icon: <Building2 size={20} /> },
                  { value: 'OTHER', label: 'Other', icon: <MoreHorizontal size={20} /> },
                ]} />
              </div>

              <div className="space-y-2"><label className="block font-semibold text-slate-700">Cargo Description</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your cargo..." rows={4} className="w-full px-4 py-3 rounded-xl border bg-white text-slate-900 resize-none" /></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Total Weight</label><div className="flex gap-2"><input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="5000" className="flex-1 px-4 py-3 rounded-xl border bg-white text-slate-900" /><select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-28 px-3 py-3 rounded-xl border bg-white text-slate-900"><option>kg</option><option>tons</option></select></div></div>
                <OptionCard label="Packaging" selected={formData.packaging} onSelect={(v) => handleSelect('packaging', v)} options={[
                  { value: 'PALLET', label: 'Palletized', icon: <Package size={20} /> },
                  { value: 'BOX', label: 'Boxes', icon: <Box size={20} /> },
                  { value: 'BAG', label: 'Bags / Sacks', icon: <ShoppingBag size={20} /> },
                  { value: 'CRATE', label: 'Crates', icon: <Archive size={20} /> },
                  { value: 'DRUM', label: 'Drums / Barrels', icon: <Inbox size={20} /> },
                  { value: 'LOOSE', label: 'Loose', icon: <AlignJustify size={20} /> },
                  { value: 'OTHER', label: 'Other', icon: <MoreHorizontal size={20} /> },
                ]} />
              </div>

              <Button type="button" onClick={continueToStepTwo} className="w-full py-4 rounded-xl font-bold text-white" style={{ backgroundColor: ROYAL_BLUE }}>Continue <ChevronRight size={20} /></Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Pickup & Delivery</h1>
          </div>
          {submitError && <div className="rounded-xl p-4 bg-red-50 text-red-700 border border-red-200"><div className="flex items-center gap-2 font-bold"><AlertCircle size={20} /> Please review the form</div><div className="mt-1 whitespace-pre-line">{submitError}</div></div>}
          {submitSuccess && <div className="rounded-xl p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-pre-line">{submitSuccess}</div>}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-visible">
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Pickup Address</label><LocationAutocomplete value={formData.pickupAddress} onChange={(v) => handleSelect('pickupAddress', v)} placeholder="Enter pickup address" className="w-full" /></div>
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Delivery Address</label><LocationAutocomplete value={formData.deliveryAddress} onChange={(v) => handleSelect('deliveryAddress', v)} placeholder="Enter delivery address" className="w-full" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Pickup Date</label><input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border bg-white text-slate-900" /></div>
                <div className="space-y-2"><label className="block font-semibold text-slate-700">Delivery Date</label><input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border bg-white text-slate-900" /></div>
              </div>
              <div className="flex gap-3"><Button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold border border-slate-200 bg-white text-slate-700">Back</Button><Button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-xl font-bold text-white" style={{ backgroundColor: ROYAL_BLUE }}>{isCalculating ? 'Calculating...' : isSubmitting ? 'Posting...' : 'Post Cargo'}</Button></div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
