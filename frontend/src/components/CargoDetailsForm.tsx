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
    <div className="relative space-y-2.5">
      <label className="flex items-center justify-center gap-2 text-center text-sm font-bold text-slate-800">{label} <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ROYAL_BLUE }} /></label>
      <Button type="button" onClick={() => setIsOpen(!isOpen)} className="min-h-12 w-full justify-between rounded-xl bg-white px-4 text-center text-sm font-semibold text-slate-800 shadow-none ring-1 ring-slate-200 transition-colors hover:bg-slate-50" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        {selectedOption ? <span className="flex min-w-0 items-center gap-2.5 truncate"><span className="shrink-0" style={{ color: ROYAL_BLUE }}>{selectedOption.icon}</span><span className="truncate">{selectedOption.label}</span></span> : <span className="font-semibold text-sm" style={{ color: ROYAL_BLUE }}>Select {label}...</span>}
        <ChevronRight className={`shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} style={{ color: ROYAL_BLUE }} size={19} />
      </Button>
      {isOpen && <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 grid max-h-64 w-full grid-cols-1 gap-2 overflow-y-auto rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 sm:grid-cols-2" style={{ border: `1px solid ${ROYAL_BLUE}` }}>
        {options.map(opt => <Button type="button" key={opt.value} onClick={() => { onSelect(opt.value); setIsOpen(false); }} className="min-h-11 justify-start gap-2.5 rounded-xl border bg-white p-3 text-left text-sm font-semibold transition-all" style={{ borderColor: selected === opt.value ? ROYAL_BLUE : '#B7C6F5', color: selected === opt.value ? ROYAL_BLUE : '#475569' }}><span className="shrink-0" style={{ color: ROYAL_BLUE }}>{opt.icon}</span><span>{opt.label}</span></Button>)}
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
    <form onSubmit={handleSubmit} className="tc-cargo-form mx-auto min-h-full w-full max-w-3xl bg-[#F8FAFC] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 text-slate-600 dark:bg-slate-950 sm:px-5 sm:pt-6 md:px-7 md:pb-10 lg:px-8">
      <style>{`\n        .tc-cargo-form { --tc-royal-blue: #4169E1; }\n        .tc-cargo-form label { font-size: 14px !important; }\n        .tc-cargo-form input, .tc-cargo-form select, .tc-cargo-form textarea { min-height: 48px; font-size: 16px !important; border-color: #CBD5E1 !important; }\n        .tc-cargo-form button { font-size: 15px !important; }\n        .tc-cargo-form input::placeholder, .tc-cargo-form textarea::placeholder { color: #64748b !important; opacity: 1; }\n        .tc-cargo-form input:focus, .tc-cargo-form select:focus, .tc-cargo-form textarea:focus { border-color: var(--tc-royal-blue) !important; box-shadow: 0 0 0 3px rgba(65,105,225,0.12) !important; outline: none; }\n      `}</style>

      <div className="mb-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-brand-700 dark:text-brand-400">Shipper workspace</p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-[#0B1F44] dark:text-white sm:text-3xl">{step === 1 ? 'Post Cargo' : 'Pickup & Delivery'}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">{step === 1 ? 'Tell us what you are moving so we can match it with the right transport capacity.' : 'Set the collection and delivery points for your shipment.'}</p>
        <div className="mx-auto mt-4 flex max-w-xs items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-brand-600" />
          <div className={`h-1.5 flex-1 rounded-full ${step === 2 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>
      </div>

      {submitError && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700 ring-1 ring-red-100"><div className="flex items-center gap-2 font-bold"><AlertCircle size={18} /> Please review the form</div><div className="mt-1 whitespace-pre-line">{submitError}</div></div>}
      {submitSuccess && <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700 ring-1 ring-emerald-100 whitespace-pre-line">{submitSuccess}</div>}

      {step === 1 ? (
        <div className="overflow-visible rounded-2xl bg-white shadow-[0_4px_20px_rgba(15,23,42,0.045)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="space-y-6 p-5 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Cargo Name</label><input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 10 bags of rice" className="w-full rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white" /></div>
              <OptionCard label="Category" selected={formData.category} onSelect={(v) => handleSelect('category', v)} options={[
                { value: 'GENERAL_MERCHANDISE', label: 'General Merchandise', icon: <Package size={18} /> },
                { value: 'FRAGILE', label: 'Fragile Items', icon: <AlertCircle size={18} /> },
                { value: 'PERISHABLE', label: 'Perishable Goods', icon: <Leaf size={18} /> },
                { value: 'ELECTRONICS', label: 'Electronics', icon: <Smartphone size={18} /> },
                { value: 'MEDICAL', label: 'Medical Supplies', icon: <Pill size={18} /> },
                { value: 'CHEMICALS', label: 'Chemicals', icon: <FlaskConical size={18} /> },
                { value: 'MACHINERY', label: 'Machinery', icon: <Factory size={18} /> },
                { value: 'AUTOMOTIVE', label: 'Automotive Parts', icon: <Truck size={18} /> },
                { value: 'CONSTRUCTION', label: 'Construction Materials', icon: <Building2 size={18} /> },
                { value: 'OTHER', label: 'Other', icon: <MoreHorizontal size={18} /> },
              ]} />
            </div>
            <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Cargo Description</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your cargo..." rows={4} className="w-full resize-none rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white" /></div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Total Weight</label><div className="flex gap-2"><input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="5000" className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white" /><select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-24 rounded-xl bg-white px-3 py-3 text-slate-900 dark:bg-slate-950 dark:text-white"><option>kg</option><option>tons</option></select></div></div>
              <OptionCard label="Packaging" selected={formData.packaging} onSelect={(v) => handleSelect('packaging', v)} options={[
                { value: 'PALLET', label: 'Palletized', icon: <Package size={18} /> },
                { value: 'BOX', label: 'Boxes', icon: <Box size={18} /> },
                { value: 'BAG', label: 'Bags / Sacks', icon: <ShoppingBag size={18} /> },
                { value: 'CRATE', label: 'Crates', icon: <Archive size={18} /> },
                { value: 'DRUM', label: 'Drums / Barrels', icon: <Inbox size={18} /> },
                { value: 'LOOSE', label: 'Loose', icon: <AlignJustify size={18} /> },
                { value: 'OTHER', label: 'Other', icon: <MoreHorizontal size={18} /> },
              ]} />
            </div>
            <Button type="button" onClick={continueToStepTwo} className="min-h-12 w-full rounded-xl font-bold text-white shadow-sm" style={{ backgroundColor: ROYAL_BLUE }}>Continue <ChevronRight size={19} /></Button>
          </div>
        </div>
      ) : (
        <div className="overflow-visible rounded-2xl bg-white shadow-[0_4px_20px_rgba(15,23,42,0.045)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="space-y-6 p-5 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Pickup Address</label><LocationAutocomplete value={formData.pickupAddress} onChange={(v) => handleSelect('pickupAddress', v)} placeholder="Enter pickup address" className="w-full" /></div>
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Delivery Address</label><LocationAutocomplete value={formData.deliveryAddress} onChange={(v) => handleSelect('deliveryAddress', v)} placeholder="Enter delivery address" className="w-full" /></div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Pickup Date</label><input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white" /></div>
              <div className="space-y-2"><label className="block font-bold text-slate-700 dark:text-slate-200">Delivery Date</label><input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-950 dark:text-white" /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Button type="button" onClick={() => setStep(1)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">Back</Button><Button type="submit" disabled={isSubmitting} className="min-h-12 w-full rounded-xl font-bold text-white" style={{ backgroundColor: ROYAL_BLUE }}>{isCalculating ? 'Calculating...' : isSubmitting ? 'Posting...' : 'Post Cargo'}</Button></div>
          </div>
        </div>
      )}
    </form>
  );
}
