import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../utils/api';

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

export default function Map({ routingMode, onRoadClick, ratingsUpdateTrigger }) {
  const { t, i18n } = useTranslation();
  const [roadsData, setRoadsData] = useState(null);
  const [mapCenter, setMapCenter] = useState([48.3794, 31.1656]); // Центр Украины
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [geoJsonKey, setGeoJsonKey] = useState(0); // Ключ для пересоздания GeoJSON слоя
  const [roadRatings, setRoadRatings] = useState({}); // Рейтинги дорог из отзывов

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

  // Загрузка рейтингов дорог
  useEffect(() => {
    const loadRatings = async () => {
      try {
        const ratings = await api.getRoadRatings();
        // Преобразуем массив в объект для быстрого доступа по segmentId
        const ratingsMap = {};
        ratings.forEach(rating => {
          ratingsMap[rating.segmentId] = rating.averageRating;
        });
        setRoadRatings(ratingsMap);
        console.log('Loaded road ratings:', ratingsMap);
      } catch (error) {
        console.error('Failed to load road ratings:', error);
      }
    };
    loadRatings();
  }, [ratingsUpdateTrigger]); // Перезагружаем рейтинги при изменении триггера

  // Пересоздаем GeoJSON слой при смене языка
  useEffect(() => {
    setGeoJsonKey(prev => prev + 1);
  }, [i18n.language]);

  // Стиль для каждой дороги
  const roadStyle = (feature) => {
    const roadName = feature.properties?.name || '';

    // Создаем стабильный ID для сегмента
    const coords = feature.geometry?.coordinates?.[0];
    if (!coords || !Array.isArray(coords) || coords.length < 2) {
      // Fallback если структура неправильная
      const quality = getRoadQuality(roadName);
      const opacity = routingMode === 'comfort' && quality === 'poor' ? 0.3 : 0.8;
      return {
        color: qualityColors[quality],
        weight: quality === 'good' ? 4 : quality === 'medium' ? 3 : 2,
        opacity: opacity,
      };
    }

    const segmentId = `road-${roadName}-${coords[0].toFixed(4)}-${coords[1].toFixed(4)}`;

    // Проверяем, есть ли рейтинг для этого сегмента
    let quality;
    if (roadRatings[segmentId] !== undefined) {
      const rating = roadRatings[segmentId];
      // Определяем качество на основе рейтинга
      if (rating < 3) {
        quality = 'poor';   // красный
      } else if (rating < 4) {
        quality = 'medium'; // желтый
      } else {
        quality = 'good';   // зеленый
      }
    } else {
      // Если рейтинга нет, используем старую логику на основе названия
      quality = getRoadQuality(roadName);
    }

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

    // Создаем стабильный ID для сегмента
    const coords = feature.geometry?.coordinates?.[0];
    if (!coords || !Array.isArray(coords) || coords.length < 2) {
      return; // Skip if invalid structure
    }

    const segmentId = `road-${roadName}-${coords[0].toFixed(4)}-${coords[1].toFixed(4)}`;

    // Определяем качество на основе рейтинга или названия
    let quality;
    if (roadRatings[segmentId] !== undefined) {
      const rating = roadRatings[segmentId];
      if (rating < 3) {
        quality = 'poor';
      } else if (rating < 4) {
        quality = 'medium';
      } else {
        quality = 'good';
      }
    } else {
      quality = getRoadQuality(roadName);
    }

    const qualityText = quality === 'good' ? t('selectedRoad.good') :
                        quality === 'medium' ? t('selectedRoad.medium') :
                        t('selectedRoad.bad');

    layer.on({
      click: (e) => {
        // Create stable ID based on road name and first coordinate
        const stableId = `road-${roadName}-${coords[0].toFixed(4)}-${coords[1].toFixed(4)}`;

        const segmentData = {
          id: stableId,
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
        ${t('selectedRoad.quality')} <span style="color: ${qualityColors[quality]}">${qualityText}</span>
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
            key={`${geoJsonKey}-${Object.keys(roadRatings).length}`}
            data={roadsData}
            style={roadStyle}
            onEachFeature={onEachFeature}
          />
        )}

        <MapController center={mapCenter} />
      </MapContainer>

      {/* Легенда */}
      <div className="absolute bottom-8 right-8 bg-dark-card border border-dark-border rounded-lg p-4 shadow-lg z-[1000]">
        <h3 className="text-sm font-semibold mb-2">{t('selectedRoad.quality')}</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.good }}></div>
            <span className="text-xs">{t('selectedRoad.good')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.medium }}></div>
            <span className="text-xs">{t('selectedRoad.medium')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1" style={{ backgroundColor: qualityColors.poor }}></div>
            <span className="text-xs">{t('selectedRoad.bad')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
