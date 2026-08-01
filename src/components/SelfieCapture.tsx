import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Upload, Image } from 'lucide-react';
import { Button } from './ui/Button';

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function SelfieCapture({ onCapture, onCancel }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || errorMessage.includes('Permission denied')) {
        setError("Camera permission denied. Please allow camera access in your browser to take a selfie. Note: Camera access is often restricted inside interactive preview frames.");
      } else {
        setError("Unable to access camera: " + errorMessage);
      }
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (image) {
      onCapture(image);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseMock = () => {
    setImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera size={20} className="text-blue-500" /> Take Selfie
          </h3>
          <Button aria-label="Action" type="button" onClick={onCancel} className="text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300">
            <X size={24} />
          </Button>
        </div>
        
        <div className="p-4 flex flex-col items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*" 
          />

          {error ? (
            <div className="text-center w-full">
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[12px] p-3.5 rounded-2xl text-left leading-relaxed mb-4">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-[13px]">
                  ⚠️ Camera Access Blocked
                </p>
                {error && error ? ((error as any).message || JSON.stringify(error)) : error}
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate- mb-4 font-medium">
                Please upload a photo from your device or use a demo selfie to bypass this step:
              </p>
              <div className="flex flex-col gap-2.5 w-full mb-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-sm transition"
                >
                  <Upload size={16} /> Upload Photo
                </Button>
                <Button
                  type="button"
                  onClick={handleUseMock}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate- hover:bg-slate-100 border border-slate-200 dark:border-slate-700 font-bold text-sm transition"
                >
                  <Image size={16} /> Use Demo Selfie
                </Button>
              </div>
            </div>
          ) : image ? (
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden mb-4">
              <img src={image} alt="Selfie" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden mb-4 animate-pulse">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          {(!error || image) && (
            <div className="flex gap-3 w-full">
              {image ? (
                <>
                  <Button type="button" onClick={handleRetake} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate- font-bold hover:bg-slate-200 transition">
                    <RefreshCw size={18} /> Retake
                  </Button>
                  <Button type="button" onClick={handleConfirm} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-50 cursor-pointer hover:shadow-sm0 transition shadow-lg shadow-blue-500/30">
                    <Check size={18} /> Confirm
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleCapture} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-50 cursor-pointer hover:shadow-sm0 transition shadow-lg shadow-blue-500/30">
                  <Camera size={18} /> Capture
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
