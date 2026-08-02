import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, Compass, ChevronLeft, Map } from 'lucide-react';
import { Button } from './ui/Button';

interface StateFilterOverlayProps {
  isOpen?: boolean;
  isVisible?: boolean;
  onClose: () => void;
  onSelectState: (stateName: string) => void;
  title?: string;
  subtitle?: string;
  isInline?: boolean;
}

const stateCities: Record<string, string[]> = {
  'Abia': ['Aba', 'Umuahia', 'Ohafia', 'Arochukwu'],
  'Adamawa': ['Yola', 'Mubi', 'Numan', 'Jimeta'],
  'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
  'Anambra': ['Onitsha', 'Awka', 'Nnewi', 'Ekwulobia'],
  'Bauchi': ['Bauchi', 'Azare', 'Misau', 'Jama\'are'],
  'Bayelsa': ['Yenagoa', 'Ogbia', 'Brass', 'Sagbama'],
  'Benue': ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'],
  'Borno': ['Maiduguri', 'Jere', 'Biu', 'Bama'],
  'Cross River': ['Calabar', 'Ikom', 'Ogoja', 'Ugep'],
  'Delta': ['Warri', 'Asaba', 'Ughelli', 'Sapele'],
  'Ebonyi': ['Abakaliki', 'Afikpo', 'Onueke', 'Ezza'],
  'Edo': ['Benin City', 'Auchi', 'Uromi', 'Ekpoma'],
  'Ekiti': ['Ado Ekiti', 'Ikere', 'Ijero', 'Oye'],
  'Enugu': ['Enugu', 'Nsukka', 'Agbani', 'Awgu'],
  'Gombe': ['Gombe', 'Kumo', 'Billiri', 'Duku'],
  'Imo': ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
  'Jigawa': ['Dutse', 'Hadejia', 'Kazaure', 'Gumel'],
  'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan', 'Saminaka'],
  'Kano': ['Kano', 'Wudil', 'Gwarzo', 'Bichi'],
  'Katsina': ['Katsina', 'Daura', 'Funtua', 'Dutsin-Ma'],
  'Kebbi': ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
  'Kogi': ['Lokoja', 'Okene', 'Idah', 'Anyigba'],
  'Kwara': ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba'],
  'Lagos': ['Ikeja', 'Apapa', 'Surulere', 'Lekki', 'Ikorodu', 'Oshodi', 'Badagry', 'Epe'],
  'Nasarawa': ['Lafia', 'Keffi', 'Akwanga', 'Karu'],
  'Niger': ['Minna', 'Bida', 'Suleja', 'Kontagora'],
  'Ogun': ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Sango Ota'],
  'Ondo': ['Akure', 'Ondo', 'Owo', 'Okitipupa'],
  'Osun': ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
  'Oyo': ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin'],
  'Plateau': ['Jos', 'Pankshin', 'Shendam', 'Bukuru'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny'],
  'Sokoto': ['Sokoto', 'Tambuwal', 'Wurno', 'Gwadabawa'],
  'Taraba': ['Jalingo', 'Wukari', 'Bali', 'Takum'],
  'Yobe': ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'],
  'Zamfara': ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Anka'],
  'FCT Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje']
};

export default function StateFilterOverlay({ 
  isOpen, 
  isVisible,
  onClose, 
  onSelectState,
  title = 'Select Route Hub',
  subtitle = 'Filtering loads across 36 states',
  isInline = false
}: StateFilterOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  const active = isOpen || isVisible;

  // All 36 Nigerian states + FCT Abuja organized for the route hub
  const states36 = Object.keys(stateCities);

  const resetState = () => {
    setSelectedState(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Filter logic
  let displayList: string[] = [];
  if (selectedState) {
    const locations = stateCities[selectedState] || [];
    displayList = locations.filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()));
  } else {
    displayList = states36.filter(state => state.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <AnimatePresence>
      {active && (
        <div className={isInline ? "w-full h-full p-4" : "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"}>
          
          {/* Backdrop blur backdrop */}
          {!isInline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
          )}

          {/* Deep Sapphire Drawer / Dialog Shell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full ${isInline ? "max-w-none h-full" : "max-w-lg sm:max-w-xl"} bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col h-[70vh] max-h-[600px] z-10`}
          >
            {/* Handle Bar for mobile drag intent visual styling */}
            <div className="w-12 h-1.5 bg-slate-300  rounded-full mx-auto mb-4 sm:hidden shrink-0" />

            {/* HEADER */}
            <div className="flex justify-between items-start mb-5 gap-4">
              <div className="space-y-1">
                {selectedState ? (
                  <Button 
                    onClick={() => { setSelectedState(null); setSearchQuery(""); }}
                    className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 mb-1 transition-colors"
                  >
                    <ChevronLeft size={16} /> Back to States
                  </Button>
                ) : null}
                <h3 className="text-xl font-black text-slate-900 dark:text-white  flex items-center gap-2">
                  {selectedState ? <Map className="text-brand-600 animate-pulse" size={20} /> : <Compass className="text-brand-600 animate-spin-slow" size={20} />}
                  {selectedState ? `Specific location in ${selectedState}` : title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-  font-medium">
                  {selectedState ? 'Select a city/LGA or enter a custom area' : subtitle}
                </p>
              </div>
              <Button 
                onClick={handleClose}
                className="p-1.5 bg-slate-50 dark:bg-slate-800  hover:bg-brand-600 border border-slate-200 dark:border-slate-700  rounded-xl text-slate-500 dark:text-slate-  hover:text-white transition cursor-pointer shrink-0"
              >
                <X size={16} />
              </Button>
            </div>

            {/* SEARCH / CUSTOM INPUT */}
            <div className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl flex items-center px-4 mb-5 group focus-within:border-brand-500 transition shrink-0">
              <Search className="text-slate-500 dark:text-slate-  mr-2.5 shrink-0 group-focus-within:text-brand-600 transition" size={18} />
              <input
                type="text"
                className="flex-1 h-13 bg-transparent text-slate-900 dark:text-white  text-sm outline-none border-none placeholder-slate-500 focus:ring-0 focus:border-transparent font-medium"
                placeholder={selectedState ? "Search or type specific area..." : "Search state..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedState && searchQuery.trim().length > 0) {
                    onSelectState(`${searchQuery.trim()}, ${selectedState}`);
                    handleClose();
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <Button 
                  onClick={() => setSearchQuery('')}
                  className="bg-slate-200  hover:bg-slate-300 :bg-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-  transition cursor-pointer uppercase tracking-wider shrink-0 ml-2"
                >
                  Clear
                </Button>
              )}
            </div>

            {selectedState && searchQuery.trim().length > 0 && displayList.length === 0 && (
              <Button 
                onClick={() => {
                  onSelectState(`${searchQuery.trim()}, ${selectedState}`);
                  handleClose();
                }}
                className="w-full mb-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <MapPin size={16} /> Use "{searchQuery.trim()}" in {selectedState}
              </Button>
            )}

            {/* LIST SCROLLABLE GRID */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 ">
              {selectedState && displayList.length > 0 && (
                <Button
                  onClick={() => {
                    onSelectState(`Anywhere in ${selectedState}`);
                    handleClose();
                  }}
                  className="w-full mb-2 flex items-center justify-between bg-emerald-50  hover:bg-emerald-100 :bg-emerald-900/40 border border-emerald-200  rounded-xl px-4 py-3 text-left transition-all duration-75 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass size={14} className="text-emerald-600 " />
                    <span className="text-emerald-900  font-bold text-xs">Entire State (Any Location)</span>
                  </div>
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2.5 pb-4">
                {displayList.map((item) => (
                  <Button
                    key={item}
                    onClick={() => {
                      if (!selectedState) {
                        setSelectedState(item);
                        setSearchQuery('');
                      } else {
                        onSelectState(`${item}, ${selectedState}`);
                        handleClose();
                      }
                    }}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-800  hover:bg-slate-100 :bg-slate-700 border border-slate-200 dark:border-slate-700  hover:border-slate-300 :border-slate-600 rounded-xl px-4 py-3.5 text-left transition-colors duration-75 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={12} className="text-slate-500 dark:text-slate-  group-hover:text-brand-600 transition shrink-0" />
                      <span className="text-slate-800 dark:text-slate-100  group-hover:text-slate-900 dark:text-white  font-semibold text-xs truncate">
                        {item}
                      </span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-  group-hover:text-brand-600 font-bold text-[10px]  transition shrink-0">
                      ➔
                    </span>
                  </Button>
                ))}
              </div>

              {displayList.length === 0 && !selectedState && (
                <div className="text-center py-12 space-y-2">
                  <span className="text-2xl block">📍</span>
                  <p className="text-slate-500 dark:text-slate-  text-xs font-bold">No states found</p>
                  <p className="text-slate-600 dark:text-slate-  text-[11px]">No logistics state matching "{searchQuery}" in Nigeria.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
