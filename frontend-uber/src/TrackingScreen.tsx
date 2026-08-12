import React,{useEffect,useState} from 'react';
import {Activity,ArrowLeft,CheckCircle2,Clock3,MapPin,Navigation,Package,RefreshCw,Truck} from 'lucide-react';
import axios from 'axios';

const API=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const api=axios.create({baseURL:API?`${API}${API.endsWith('/api')?'':'/api'}`:'/api',withCredentials:true,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(c=>{const t=localStorage.getItem('tc_token')||localStorage.getItem('token')||'';if(t)c.headers.Authorization=`Bearer ${t}`;return c});

type Load={id:string;title?:string;origin:string;destination:string;weightKg?:number;status:string;paymentStatus?:string;createdAt:string;suggestedBudget?:number|null};
const steps=['AVAILABLE','QUOTE_ACCEPTED','TRANSIT_ONGOING','DELIVERED'];
const label=(s:string)=>s.replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());

export default function TrackingScreen({loadId,onBack}:{loadId?:string;onBack:()=>void}){
 const [load,setLoad]=useState<Load|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const loadShipment=async()=>{if(!loadId){setError('Select a shipment first.');setLoading(false);return}setLoading(true);setError('');try{const r=await api.get(`/loads/${loadId}`);setLoad(r.data||null)}catch(e:any){setError(e.response?.data?.error||'Unable to load shipment tracking.')}finally{setLoading(false)}};
 useEffect(()=>{void loadShipment();const id=window.setInterval(()=>void loadShipment(),15000);return()=>window.clearInterval(id)},[loadId]);
 const active=Math.max(0,steps.indexOf(load?.status||'AVAILABLE'));
 return <div className="track-screen"><div className="track-toolbar"><button className="icon" onClick={onBack}><ArrowLeft/></button><div><b>Live tracking</b><span>Shipment status</span></div><button className="icon" onClick={()=>void loadShipment()}><RefreshCw className={loading?'spin':''}/></button></div>{error?<div className="error">{error}</div>:loading&&!load?<div className="track-loading"><Activity className="spin"/><span>Loading shipment…</span></div>:load?<><div className="track-map"><div className="map-grid"/><div className="route-line"/><div className="map-pin origin"><MapPin/></div><div className="map-pin destination"><Navigation/></div><div className="truck-marker"><Truck/></div><div className="map-caption"><span>LIVE</span><b>{label(load.status)}</b></div></div><article className="track-card"><div className="track-card-head"><div><span className="eyebrow">SHIPMENT</span><h1>{load.title||'Cargo shipment'}</h1></div><span className="status">{label(load.status)}</span></div><div className="route-detail"><div><small>Pickup</small><b>{load.origin}</b></div><div className="route-arrow">→</div><div><small>Delivery</small><b>{load.destination}</b></div></div><div className="track-meta"><span><Package/> {Number(load.weightKg||0).toLocaleString()} kg</span><span><Clock3/> {new Date(load.createdAt).toLocaleDateString()}</span></div></article><article className="timeline"><h2>Shipment progress</h2>{steps.map((step,i)=><div className={`timeline-row ${i<=active?'done':''}`} key={step}><div className="timeline-dot">{i<active?<CheckCircle2/>:<span>{i+1}</span>}</div><div><b>{label(step)}</b><p>{i===0?'Shipment is available for matching.':i===1?'A transporter has accepted the shipment terms.':i===2?'Your cargo is currently in transit.':'Delivery has been completed.'}</p></div></div>)}</article></>:null}</div>;
}
