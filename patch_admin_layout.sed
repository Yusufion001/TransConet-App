/<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/,/^{currentRole === 'ADMIN' && (/c\
      <div className="w-full">\
        {activeTab === 'OVERVIEW' && (\
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">\
            <div className="lg:col-span-1 space-y-6">\
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">\
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">\
                  <Cpu className="text-blue-600" size={18} /> Role Elevation Console\
                </h3>\
                <p className="text-xs text-slate-500 leading-normal">\
                  Elevating your session role to <strong className="text-blue-600">ADMIN</strong> grants you access to platform-wide compliance actions and logs.\
                </p>\
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">\
                  <div className="flex justify-between items-center text-xs">\
                    <span className="text-slate-500">Registered Phone</span>\
                    <span className="font-mono text-slate-800 font-semibold">{userPhone}</span>\
                  </div>\
                  <div className="flex justify-between items-center text-xs">\
                    <span className="text-slate-500">Registered Email</span>\
                    <span className="font-mono text-slate-800 font-semibold">{userEmail || 'N/A'}</span>\
                  </div>\
                  <div className="flex justify-between items-center text-xs">\
                    <span className="text-slate-500">Active Role</span>\
                    <span className={`font-black font-sans tracking-wide ${currentRole === 'ADMIN' ? 'text-blue-600' : 'text-slate-900'}`}>{currentRole}</span>\
                  </div>\
                </div>\
                {currentRole !== 'ADMIN' ? (\
                  <button onClick={() => requestAdminAccess()} disabled={roleLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">\
                    {roleLoading ? 'Verifying...' : 'Authenticate Admin Credentials'} <CheckCircle2 size={16} />\
                  </button>\
                ) : (\
                  <button onClick={dropAdminAccess} disabled={roleLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">\
                    {roleLoading ? 'Revoking...' : 'Revoke Admin Privileges'} <XCircle size={16} />\
                  </button>\
                )}\
              </div>\
            </div>\
            \
            <div className="lg:col-span-2 space-y-6">\
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">\
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">\
                  <Database className="text-amber-500" size={18} /> Database Seed Deck\
                </h3>\
                <p className="text-xs text-slate-500 mb-6">Inject robust simulated transporter data to populate the Marketplace load matching engines and Tracking UI components.</p>\
                <button onClick={injectMockData} disabled={seedLoading || currentRole !== 'ADMIN'} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">\
                  {seedLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}\
                  {seedLoading ? 'Seeding Database...' : 'Seed Core Drivers (Simulated)'}\
                </button>\
              </div>\
            </div>\
          </div>\
        )}\
        \
        {activeTab === 'ANALYTICS' && (\
          <AdminAnalytics metrics={dashboardMetrics} />\
        )}\
        \
        {activeTab === 'USERS' && (\
          <AdminUserManagement />\
        )}\
        \
        {activeTab === 'LIVE_TRIPS' && (\
          <AdminLiveTrips />\
        )}\
        \
        {activeTab === 'DISPUTES' && (\
          <AdminDisputes />\
        )}\
      </div>\
      \
      {currentRole === 'ADMIN' && (
