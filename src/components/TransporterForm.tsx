import React, { useState } from 'react';
import { Truck, Video, Building2, FileText, CheckCircle2, AlertCircle, UploadCloud, Bell, Share2, Camera, ShieldCheck, Zap, ChevronDown, Download, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import VehicleVerificationUpload from './VehicleVerificationUpload';
import { Button } from './ui/Button';

const TRUCK_BRANDS = [
  'Volvo Trucks', 'Scania', 'Mercedes-Benz Trucks', 'MAN Truck & Bus', 'DAF Trucks', 'Iveco', 'Renault Trucks', 'Ford Trucks', 'Mack Trucks', 'Kenworth', 
  'Peterbilt', 'Freightliner Trucks', 'Western Star', 'International Motors', 'Isuzu', 'Hino Motors', 'Fuso', 'UD Trucks', 'Tata Motors', 'Ashok Leyland', 
  'Eicher Trucks', 'FAW Trucks', 'Sinotruk', 'Shacman', 'Dongfeng Commercial Vehicles', 'JAC Motors', 'Foton Motor', 'CAMC', 'SANY'
];

const TRUCK_TYPES = [
  'Light-duty trucks', 'Medium-duty trucks', 'Heavy-duty trucks', 'Tractor heads', 'Tipper (dump) trucks', 
  'Flatbed trucks', 'Refrigerated trucks', 'Tanker trucks', 'Cement mixers', 'Cargo vans'
];

function InteractiveSelector({ options, selected, onSelect, label, placeholder }: { options: string[], selected: string, onSelect: (value: string) => void, label: string, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-2 relative">
      {label && <label className="text-sm font-bold text-slate-600 dark:text-slate-">{label}</label>}
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- flex justify-between items-center text-left"
      >
        <span className={selected ? 'text-slate-800 dark:text-slate-100 text-sm' : 'text-slate-500 dark:text-slate-400 text-sm'}>{selected || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((opt) => (
              <Button
                type="button"
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${selected === opt ? 'bg-blue-600/20 border border-blue-500 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-600'} `}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransporterForm() {
  const [registrationMode, setRegistrationMode] = useState<'single' | 'quick' | 'bulk'>('single');
  
  // Single Upload State
  const [brand, setBrand] = useState('');
  const [truckType, setTruckType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [tonnage, setTonnage] = useState(''); 
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Quick List State
  const [quickVehicles, setQuickVehicles] = useState([{ id: Date.now(), plate: '', brand: '', type: '', tonnage: '' }]);
  
  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [parsedTrucks, setParsedTrucks] = useState<any[]>([]);
  
  // Common State
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
      setErrorMsg('');
      // Simulate parsing
      setTimeout(() => {
        setParsedTrucks([
          { brand: 'Volvo Trucks', type: 'Flatbed trucks', plate: 'KJA-234BB', tonnage: '30' },
          { brand: 'Scania', type: 'Tractor heads', plate: 'LSR-992XC', tonnage: '40' },
          { brand: 'MAN Truck & Bus', type: 'Tipper (dump) trucks', plate: 'ABC-123YY', tonnage: '20' }
        ]);
      }, 1000);
    }
  };

  const handleDownloadTemplate = () => {
    alert("Downloading TransConet_Fleet_Template.csv");
  };

  const addQuickVehicle = () => {
    setQuickVehicles([...quickVehicles, { id: Date.now(), plate: '', brand: '', type: '', tonnage: '' }]);
  };

  const removeQuickVehicle = (id: number) => {
    if (quickVehicles.length > 1) {
      setQuickVehicles(quickVehicles.filter(v => v.id !== id));
    }
  };

  const updateQuickVehicle = (id: number, field: string, value: string) => {
    setQuickVehicles(quickVehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registrationMode === 'single') {
      if (!brand || !truckType || !plateNumber) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      if (!videoUrl) {
        setErrorMsg('Please upload and transmit your 15-second roadworthiness inspection video.');
        return;
      }
    } else if (registrationMode === 'quick') {
      const isValid = quickVehicles.every(v => v.brand && v.type && v.plate);
      if (!isValid) {
        setErrorMsg('Please ensure all vehicles have a Plate Number, Brand, and Type selected.');
        return;
      }
    } else {
      if (!bulkFile || parsedTrucks.length === 0) {
        setErrorMsg('Please upload a valid CSV/Excel file containing your fleet data.');
        return;
      }
    }

    setErrorMsg('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    let vehicleCount = 1;
    if (registrationMode === 'quick') vehicleCount = quickVehicles.length;
    if (registrationMode === 'bulk') vehicleCount = parsedTrucks.length;

    return (
      <div className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate- p-8 rounded-3xl text-center space-y-4 max-w-2xl mx-auto border border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 bg-emerald-600/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-">Fleet Registration Submitted!</h2>
        <p className="text-sm text-slate-600 dark:text-slate- max-w-md mx-auto">
          Your fleet profile ({vehicleCount} vehicle{vehicleCount > 1 ? 's' : ''}) is queued for Admin review. Our verification team will reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate- p-4 md:p-10 space-y-8 max-w-3xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col relative group">
          <span className="text-[24px] sm:text-[28px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
          </span>
          <p className="text-[7.5px] text-slate-500 dark:text-slate- font-bold tracking-[0.15em] uppercase pl-0.5 mt-[-2px]">Connecting Cargo with Capacity</p>
        </div>
        <div className="flex gap-3">
          <Bell className="text-slate-600 dark:text-slate-" size={20}/>
          <Share2 className="text-slate-600 dark:text-slate-" size={20}/>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row mb-6 gap-1">
        <Button 
          onClick={() => { setRegistrationMode('single'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition ${registrationMode === 'single' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-blue-50 cursor-pointer hover:shadow-sm'}`}
        >
          Single Truck
        </Button>
        <Button 
          onClick={() => { setRegistrationMode('quick'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition ${registrationMode === 'quick' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-blue-50 cursor-pointer hover:shadow-sm'}`}
        >
          Quick Multiple
        </Button>
        <Button 
          onClick={() => { setRegistrationMode('bulk'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition ${registrationMode === 'bulk' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-blue-50 cursor-pointer hover:shadow-sm'}`}
        >
          Bulk File Upload
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate- flex items-center gap-3">
          <Truck className="text-blue-500" size={24} /> 
          {registrationMode === 'single' && 'Register Vehicle'}
          {registrationMode === 'quick' && 'Quick Fleet Add'}
          {registrationMode === 'bulk' && 'Bulk Fleet Upload'}
        </h2>
        
            <div className="space-y-4 pt-2 border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate- flex items-center gap-2"><Building2 size={18} className="text-purple-500"/> Corporate Registration (Optional)</h3>
              <p className="text-slate-600 dark:text-slate- text-xs">Registering as a company? Provide your CAC details to unlock premium corporate clients.</p>
              <input type="text" placeholder="Company Name" className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              <input type="text" placeholder="CAC Registration Number" className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            </div>
        {registrationMode === 'single' && (
          <>
            <p className="text-slate-600 dark:text-slate- text-sm">Provide your vehicle details for quick verification and start receiving cargo opportunities.</p>
            <div className="space-y-4">
              <InteractiveSelector
                label="Manufacturer / Brand"
                placeholder="Select Manufacturer / Brand"
                options={TRUCK_BRANDS}
                selected={brand}
                onSelect={setBrand}
              />
              
              <InteractiveSelector
                label="Truck Body Configuration"
                placeholder="Select Body Type"
                options={TRUCK_TYPES}
                selected={truckType}
                onSelect={setTruckType}
              />

              <label className="text-sm font-bold text-slate-600 dark:text-slate- block mt-4 mb-2">Official License Plate Number</label>
              <input type="text" required placeholder="e.g., LSR-123XA" value={plateNumber} onChange={e => setPlateNumber(e.target.value.toUpperCase())} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              
              <label className="text-sm font-bold text-slate-600 dark:text-slate- block mt-4 mb-2">Maximum Payload Capacity (Optional)</label>
              <input type="text" placeholder="e.g., 30 Tons" value={tonnage} onChange={e => setTonnage(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>

            {/* Physical Asset Inspection */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <h3 className="font-bold text-slate-800 dark:text-slate- flex items-center gap-2"><ShieldCheck size={18} className="text-blue-500"/> Physical Asset Inspection</h3>
                <p className="text-slate-600 dark:text-slate- text-xs">Upload the following for quick verification.</p>
                <VehicleVerificationUpload onUploadComplete={(url) => { setVideoUrl(url); setErrorMsg(''); }} />
            </div>
          </>
        )}

        {registrationMode === 'quick' && (
          <>
            <p className="text-slate-600 dark:text-slate- text-sm">Add multiple vehicles directly from this page without needing an external spreadsheet.</p>
            
            <div className="space-y-4">
              {quickVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate- text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">{index + 1}</div>
                      Vehicle {index + 1}
                    </h4>
                    {quickVehicles.length > 1 && (
                      <Button 
                        type="button" 
                        onClick={() => removeQuickVehicle(vehicle.id)}
                        className="text-slate-400 dark:text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Plate Number (e.g., KJA-123AA)" 
                        value={vehicle.plate} 
                        onChange={e => updateQuickVehicle(vehicle.id, 'plate', e.target.value.toUpperCase())} 
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Capacity (e.g., 30 Tons)" 
                        value={vehicle.tonnage} 
                        onChange={e => updateQuickVehicle(vehicle.id, 'tonnage', e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate- focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <InteractiveSelector
                        label=""
                        placeholder="Select Brand"
                        options={TRUCK_BRANDS}
                        selected={vehicle.brand}
                        onSelect={(val) => updateQuickVehicle(vehicle.id, 'brand', val)}
                      />
                    </div>
                    <div>
                      <InteractiveSelector
                        label=""
                        placeholder="Select Type"
                        options={TRUCK_TYPES}
                        selected={vehicle.type}
                        onSelect={(val) => updateQuickVehicle(vehicle.id, 'type', val)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                type="button"
                onClick={addQuickVehicle}
                className="w-full py-3 md:py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:border-blue-300 transition"
              >
                <Plus size={20} /> Add Another Vehicle
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
               <AlertCircle className="shrink-0 text-amber-500 mt-0.5" size={18} />
               <p>Videos and physical inspections for quick-listed fleets will be scheduled by our team via email after submission.</p>
            </div>
          </>
        )}

        {registrationMode === 'bulk' && (
          <>
            <p className="text-slate-600 dark:text-slate- text-sm">Upload multiple vehicles at once using our spreadsheet template. Ideal for large fleet operators.</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Download Template</h4>
                  <p className="text-xs text-blue-700 mt-1">Fill out this CSV file with your fleet details.</p>
                </div>
                <Button 
                  type="button" 
                  onClick={handleDownloadTemplate}
                  className="bg-white dark:bg-slate-900 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-blue-200 hover:bg-blue-50 cursor-pointer hover:shadow-sm transition flex items-center gap-2"
                >
                  <Download size={16} /> Template
                </Button>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-white dark:bg-slate-900 hover:bg-blue-50 cursor-pointer hover:shadow-sm transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 dark:text-slate-400 mb-3" />
                  <p className="mb-2 text-sm text-slate-600 dark:text-slate- font-medium"><span className="font-bold text-blue-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500 dark:text-slate-">.CSV, .XLS, or .XLSX (Max. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleBulkUpload} />
              </label>

              {bulkFile && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <FileText className="text-emerald-500" size={24} />
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-">{bulkFile.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-">{(bulkFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  
                  {parsedTrucks.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate- uppercase tracking-wider mb-3">Preview ({parsedTrucks.length} Vehicles Found)</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {parsedTrucks.map((truck, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">
                                {truck.plate}
                              </div>
                              <span className="text-slate-700 dark:text-slate- font-medium">{truck.brand}</span>
                            </div>
                            <span className="text-slate-500 dark:text-slate- text-xs">{truck.type} • {truck.tonnage}T</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-sm text-slate-600 dark:text-slate-">Parsing fleet data...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {errorMsg && <div className="text-rose-500 bg-rose-50 p-4 rounded-xl text-sm flex items-start gap-2 border border-rose-100"><AlertCircle size={16} className="mt-0.5 shrink-0"/> {errorMsg}</div>}

        <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-blue-500/25 hover:opacity-95 transition-opacity mt-4">
          {isSubmitting ? 'Processing...' : (
            registrationMode === 'single' ? 'Register Fleet' : 
            registrationMode === 'quick' ? `Register ${quickVehicles.length} Vehicle${quickVehicles.length > 1 ? 's' : ''}` : 
            'Upload Bulk Fleet'
          )}
        </Button>

        <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mt-4">
            <div className="flex flex-col items-center flex-1 gap-2 p-2">
                <ShieldCheck className="text-blue-500"/>
                <span className="text-[10px] text-center font-bold text-slate-600 dark:text-slate-">Verified Fleet</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2 p-2">
                <Truck className="text-blue-500"/>
                <span className="text-[10px] text-center font-bold text-slate-600 dark:text-slate-">Receive Cargo</span>
            </div>
            <div className="flex flex-col items-center flex-1 gap-2 p-2">
                <Zap className="text-blue-500"/>
                <span className="text-[10px] text-center font-bold text-slate-600 dark:text-slate-">Quick Reg</span>
            </div>
        </div>
                
        <p className="text-center text-slate-500 dark:text-slate- text-[10px] flex items-center justify-center gap-1"><CheckCircle2 size={10} className="text-emerald-500"/> Your fleet profile will become visible upon verification.</p>
      </form>
    </div>
  );
}
