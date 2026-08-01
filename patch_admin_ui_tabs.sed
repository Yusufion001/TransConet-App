/{\/\* Grid: Left - Controls & Elevation, Right - Queue & Logs \*\//i\
      {/* Admin Tabs Navigation */}\
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">\
        {[ \
          { id: 'OVERVIEW', label: 'Platform Overview', icon: Globe },\
          { id: 'ANALYTICS', label: 'Analytics & Revenue', icon: DollarSign },\
          { id: 'USERS', label: 'User & Compliance', icon: UserCheck },\
          { id: 'LIVE_TRIPS', label: 'Live Operations', icon: Activity },\
          { id: 'DISPUTES', label: 'Disputes & Escrow', icon: AlertTriangle }\
        ].map(tab => (\
          <button\
            key={tab.id}\
            onClick={() => setActiveTab(tab.id as any)}\
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${\
              activeTab === tab.id \
                ? 'bg-blue-600 text-white shadow-md' \
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'\
            }`}\
          >\
            <tab.icon size={18} /> {tab.label}\
          </button>\
        ))}\
      </div>\

