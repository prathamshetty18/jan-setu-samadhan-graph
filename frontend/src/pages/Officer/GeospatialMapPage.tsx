import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Layers, Info, Filter, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintListItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

// Fix default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers
const createCustomIcon = (category: string) => {
  let color = '#315B8A';
  if (category === 'Roads') color = '#D97706';
  else if (category === 'Waste Management') color = '#059669';
  else if (category === 'Drainage') color = '#0284C7';
  else if (category === 'Electricity') color = '#CA8A04';
  else if (category === 'Public Safety') color = '#E11D48';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">•</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export const GeospatialMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [wardGeoJSON, setWardGeoJSON] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        // Load full complaints with coordinates
        const list = await api.getComplaints();
        const fullDetails = await Promise.all(
          list.map((c) => api.getComplaintById(c.id).catch(() => null))
        );
        setComplaints(fullDetails.filter((c) => c && c.latitude && c.longitude));

        // Load ward boundary polygons
        const geo = await api.getWardGeoJSON();
        setWardGeoJSON(geo);
      } catch (err) {
        console.error("Failed to load geospatial data", err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  const filteredComplaints = selectedCategory
    ? complaints.filter((c) => c.category === selectedCategory)
    : complaints;

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-gov shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-govblue" />
            <h1 className="text-base font-bold text-slate-900">
              Municipal Geospatial Intelligence Map
            </h1>
            <span className="text-[10px] font-bold text-amber-800 bg-[#FFF4D6] px-2 py-0.5 rounded border border-[#FFE299]">
              DEMO DATASET
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Geographic distribution of citizen grievances across municipal wards and recurring hotspots.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 font-medium"
          >
            <option value="">All Categories ({complaints.length} markers)</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Roads">Roads & Footpaths</option>
            <option value="Electricity">Electricity</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Drainage">Drainage</option>
            <option value="Public Safety">Public Safety</option>
          </select>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative bg-white rounded-lg border border-[#CBD5E1] shadow-gov overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Loading municipal geospatial map and ward boundaries...
          </div>
        ) : (
          <MapContainer
            center={[12.9550, 77.6350]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Ward Boundary Polygons */}
            {wardGeoJSON && (
              <GeoJSON
                data={wardGeoJSON}
                style={{
                  color: '#315B8A',
                  weight: 2,
                  dashArray: '4',
                  fillColor: '#EAF2FA',
                  fillOpacity: 0.25
                }}
              />
            )}

            {/* Complaint Pins */}
            {filteredComplaints.map((c) => (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                icon={createCustomIcon(c.category)}
              >
                <Popup className="civic-map-popup">
                  <div className="p-2 space-y-1.5 text-xs text-left max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <span className="font-mono font-bold text-govblue">{c.complaint_code}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{c.title}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">"{c.description}"</p>
                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                      <p>Category: <strong>{c.category}</strong></p>
                      <p>Locality: <strong>{c.locality}</strong></p>
                      <p>Department: <strong>{c.assigned_department_name || c.recommended_department_name}</strong></p>
                    </div>
                    <div className="pt-1.5">
                      <Link
                        to={`/officer/complaints/${c.id}`}
                        className="block text-center py-1 bg-govblue text-white rounded text-[11px] font-semibold hover:bg-govblue-hover transition-colors"
                      >
                        Inspect Grievance Details →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#CBD5E1] shadow-md z-[1000] text-[11px] space-y-1.5">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Grievance Categories</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#315B8A]" /> Water Supply</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Roads & Potholes</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Waste Sanitation</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> Drainage</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]" /> Electricity</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" /> Public Safety</span>
          </div>
        </div>
      </div>

    </div>
  );
};

