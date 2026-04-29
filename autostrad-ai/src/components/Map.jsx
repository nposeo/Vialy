import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Функция определения качества дороги на основе названия
const getRoadQuality = (roadName) => {
  if (!roadName) return 'medium';

  const name = roadName.toUpperCase();

  // М - международные трассы (обычно лучшее качество)
  if (name.startsWith('М ') || name.startsWith('М0') || name.startsWith('М1') || name.startsWith('М2')) {
    return 'good';
  }

  // Н - национальные дороги (среднее качество)
  if (name.startsWith('Н ') || name.startsWith('Н0') || name.startsWith('Н1')) {
    return 'medium';
  }

  // Остальные дороги (плохое качество)
  return 'poor';
};

// Цвета для разного качества дорог
const qualityColors = {
  good: '#22c55e',    // зеленый
  medium: '#eab308',  // желтый
  poor: '#ef4444',    // красный
};

// Компонент для управления картой
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

export default function Map({ routingMode, onRoadClick }) {
  const [roadsData, setRoadsData] = useState(null);
  const [mapCenter, setMapCenter] = useState([48.3794, 31.1656]); // Центр Украины
  const [selectedRoad, setSelectedRoad] = useState(null);

  useEffect(() => {
    // Загрузка GeoJSON данных
    fetch('/roads.geojson')
      .then(response => response.json())
      .then(data => {
        console.log('Loaded roads data:', data);
        setRoadsData(data);
      })
      .catch(error => console.error('Error loading roads data:', error));
  }, []);

  // Стиль для каждой дороги
  const roadStyle = (feature) => {
    const roadName = feature.properties?.name || '';
    const quality = getRoadQuality(roadName);

    // В режиме "Комфортный" делаем плохие дороги полупрозрачными
    const opacity = routingMode === 'comfort' && quality === 'poor' ? 0.3 : 0.8;

    return {
      color: qualityColors[quality],
      weight: quality === 'good' ? 4 : quality === 'medium' ? 3 : 2,
      opacity: opacity,
    };
  };

  // Обработчик клика по дороге
  const onEachFeature = (feature, layer) => {
    const roadName = feature.properties?.name || 'Неизвестная дорога';
    const quality = getRoadQuality(roadName);
    const qualityText = quality === 'good' ? 'Хорошее' : quality === 'medium' ? 'Среднее' : 'Плохое';

    layer.on({
      click: (e) => {
        const segmentData = {
          id: feature.id || `segment-${Date.now()}`,
          properties: {
            ...feature.properties,
            name: roadName,
            quality: quality,
          },
          geometry: feature.geometry,
          coordinates: e.latlng,
        };

        setSelectedRoad(segmentData);
        if (onRoadClick) {
          onRoadClick(segmentData);
        }
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 6,
          opacity: 1,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(roadStyle(feature));
      },
    });

    layer.bindPopup(`
      <div style="color: #000;">
        <strong>${roadName}</strong><br/>
        Качество: <span style="color: ${qualityColors[quality]}">${qualityText}</span>
      </div>
    `);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {roadsData && (
          <GeoJSON
            data={roadsData}
            style={roadStyle}
            onEachFeature={onEachFeature}
          />
        )}

        <MapController center={mapCenter} />
      </MapContainer>

      {/* Легенда */}
      <div className="absolute bottom-8 right-8 bg-dark-card border border-dark-border rounded-lg p-4 shadow-lg z-[1000]">
        <h3 className="text-sm font-semibold mb-2">Качество дорог</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.good }}></div>
            <span className="text-xs">Хорошее</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.medium }}></div>
            <span className="text-xs">Среднее</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.poor }}></div>
            <span className="text-xs">Плохое</span>
          </div>
        </div>
      </div>
    </div>
  );
}
