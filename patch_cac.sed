/Tier 2 Box/i\
                      {/* Business Verification (Optional) Box */}\
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm ">\
                        <div className="flex justify-between items-center mb-4">\
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">\
                            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px]">CORPORATE</span>\
                            Business Verification (CAC / NIN)\
                          </h4>\
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Optional</span>\
                        </div>\
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">\
                          Upload your Corporate Affairs Commission (CAC) certificate or National ID to establish corporate trust and unlock enterprise shippers.\
                        </p>\
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl bg-slate-50 hover:bg-white transition cursor-pointer group">\
                          <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center">\
                            <Building2 size={20} className="text-slate-600 group-hover:text-purple-500 mb-2 transition" />\
                            <p className="mb-1 text-xs text-slate-700 font-bold"><span className="text-purple-500">Upload CAC / NIN</span></p>\
                            <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, PDF</p>\
                          </div>\
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'cac')} />\
                        </label>\
                      </div>
