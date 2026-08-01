156i\
      {uploadStage && (\
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">\
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">\
            <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center relative">\
               <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>\
               {uploadStage === 'ENCRYPTING' ? <Lock className="text-blue-600" size={32} /> :\
                uploadStage === 'FRAUD_CHECK' ? <Cpu className="text-blue-600 animate-pulse" size={32} /> :\
                <ShieldCheck className="text-emerald-500" size={32} />}\
            </div>\
            <h3 className="text-lg font-black text-slate-900 mb-2">Secure Processing</h3>\
            <p className="text-sm font-bold text-slate-500">{uploadProgressText}</p>\
          </div>\
        </div>\
      )}
