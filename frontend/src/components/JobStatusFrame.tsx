import React, { useState, useEffect } from 'react';
import { CheckCircle2, Truck, CreditCard, PackageCheck, AlertCircle } from 'lucide-react';

interface JobStatusFrameProps {
  status: string; // 'AVAILABLE', 'QUOTE_ACCEPTED', 'TRANSIT_ONGOING', 'DELIVERED'
  paymentStatus: string; // 'PENDING', 'ESCROW_FUNDED', 'PAID', 'RELEASED'
  isEscrowEnabled: boolean;
}

export default function JobStatusFrame({ status, paymentStatus, isEscrowEnabled }: JobStatusFrameProps) {
  // Compute progress steps based on Escrow toggle
  const steps = [
    { id: 'QUOTE_ACCEPTED', label: 'Quote Accepted', icon: <CheckCircle2 size={16} /> }
  ];

  if (isEscrowEnabled) {
    steps.push({ id: 'PAID', label: 'Escrow Paid', icon: <CreditCard size={16} /> });
  }

  steps.push({ id: 'TRANSIT_ONGOING', label: 'Transit Ongoing', icon: <Truck size={16} /> });
  steps.push({ id: 'DELIVERED', label: 'Delivered', icon: <PackageCheck size={16} /> });
  if (isEscrowEnabled) {
    steps.push({ id: 'RELEASED', label: 'Funds Released', icon: <CheckCircle2 size={16} /> });
  }

  // Map backend status to step index
  const getActiveStepIndex = () => {
    if (isEscrowEnabled && paymentStatus === 'RELEASED') return steps.findIndex(s => s.id === 'RELEASED');
    if (status === 'DELIVERED') return steps.findIndex(s => s.id === 'DELIVERED');
    if (status === 'TRANSIT_ONGOING') return steps.findIndex(s => s.id === 'TRANSIT_ONGOING');
    if (status === 'QUOTE_ACCEPTED') {
      if (isEscrowEnabled && (paymentStatus === 'ESCROW_FUNDED' || paymentStatus === 'PAID')) {
        return steps.findIndex(s => s.id === 'PAID');
      }
      return steps.findIndex(s => s.id === 'QUOTE_ACCEPTED');
    }
    return -1; // AVAILABLE or unknown
  };

  const activeIndex = getActiveStepIndex();

  if (status === 'AVAILABLE') {
    return (
      <div className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-xl p-4 text-center">
        <p className="text-slate-500 dark:text-slate-  text-sm font-medium">Waiting for quotes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-xl p-5 shadow-sm ">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-  mb-4 tracking-tight uppercase">Job Lifecycle Tracking</h3>
      
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800  -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-75"
          style={{ width: `${Math.max(0, (activeIndex / (steps.length - 1)) * 100)}%` }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= activeIndex;
            const isCurrent = index === activeIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-75 ${
                    isCompleted 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md  shadow-blue-500/20' 
                      : 'bg-white dark:bg-slate-900  border-slate-200 dark:border-slate-700  text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {step.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700 dark:text-slate-200 ' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {isEscrowEnabled && paymentStatus !== 'ESCROW_FUNDED' && paymentStatus !== 'PAID' && status === 'QUOTE_ACCEPTED' && (
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-xs font-bold text-amber-800">Escrow Payment Required</p>
            <p className="text-xs text-amber-700 mt-0.5">Please fund the escrow to authorize the driver's departure.</p>
          </div>
        </div>
      )}
    </div>
  );
}
