import { useState } from 'react';
import Map from './components/Map';
import './index.css';

function App() {
  const [routingMode, setRoutingMode] = useState('fast');
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [rewards, setRewards] = useState(0);

  const handleRoadClick = (roadData) => {
    setSelectedRoad(roadData);
  };

  const handleConfirmQuality = () => {
    if (!selectedRoad) {
      alert('Выберите дорогу на карте');
      return;
    }

    setRewards(prev => prev + 10);
    alert(`✅ Качество подтверждено!\n+10 $AUTO токенов\n\nДорога: ${selectedRoad.name}\nКачество: ${selectedRoad.quality === 'good' ? 'Хорошее' : selectedRoad.quality === 'medium' ? 'Среднее' : 'Плохое'}`);
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      {/* Sidebar */}
      <div className="w-80 bg-dark-card border-r border-dark-border flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <h1 className="text-2xl font-bold mb-2">AutostradAI</h1>
          <p className="text-sm text-gray-400">DePIN навигатор на Solana</p>
        </div>

        {/* Wallet Connection */}
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-sm font-semibold mb-3">Кошелек</h2>
          <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg h-10 text-sm font-medium transition-colors">
            Подключить кошелек
          </button>
          <p className="text-xs text-gray-400 mt-2">Установите Phantom или Solflare</p>
        </div>

        {/* Routing Mode */}
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-sm font-semibold mb-3">Режим маршрута</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRoutingMode('fast')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                routingMode === 'fast'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
              }`}
            >
              ⚡ Быстрый
            </button>
            <button
              onClick={() => setRoutingMode('comfort')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                routingMode === 'comfort'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
              }`}
            >
              🛣️ Комфортный
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {routingMode === 'fast'
              ? 'Кратчайший путь по времени'
              : 'Объезд плохих участков дорог'}
          </p>
        </div>

        {/* Selected Road Info */}
        {selectedRoad && (
          <div className="p-6 border-b border-dark-border">
            <h2 className="text-sm font-semibold mb-3">Выбранная дорога</h2>
            <div className="bg-dark-bg rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs text-gray-400">Название:</p>
                <p className="text-sm font-medium">{selectedRoad.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Качество:</p>
                <p className={`text-sm font-medium ${
                  selectedRoad.quality === 'good' ? 'text-green-500' :
                  selectedRoad.quality === 'medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {selectedRoad.quality === 'good' ? 'Хорошее' :
                   selectedRoad.quality === 'medium' ? 'Среднее' : 'Плохое'}
                </p>
              </div>
              <button
                onClick={handleConfirmQuality}
                className="w-full mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Подтвердить качество
              </button>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="p-6 mt-auto">
          <h2 className="text-sm font-semibold mb-3">Вознаграждения</h2>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
            <p className="text-xs text-purple-200 mb-1">Баланс токенов</p>
            <p className="text-3xl font-bold">{rewards} $AUTO</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Подтверждайте качество дорог и зарабатывайте токены
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          routingMode={routingMode}
          onRoadClick={handleRoadClick}
        />
      </div>
    </div>
  );
}

export default App;
