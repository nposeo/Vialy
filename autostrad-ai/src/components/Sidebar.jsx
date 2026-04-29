import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';

export default function Sidebar({ routingMode, setRoutingMode, selectedRoad, rewards, setRewards }) {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmQuality = async () => {
    if (!publicKey || !signMessage || !selectedRoad) {
      alert('Подключите кошелек и выберите дорогу на карте');
      return;
    }

    setIsConfirming(true);

    try {
      // Создаем сообщение для подписи
      const message = new TextEncoder().encode(
        `AutostradAI Quality Confirmation\nRoad: ${selectedRoad.name}\nQuality: ${selectedRoad.quality}\nCoordinates: ${selectedRoad.coordinates.lat.toFixed(6)}, ${selectedRoad.coordinates.lng.toFixed(6)}\nTimestamp: ${Date.now()}`
      );

      // Подписываем сообщение
      const signature = await signMessage(message);

      console.log('Signature:', signature);
      console.log('Message signed successfully');

      // Начисляем токены
      setRewards(prev => prev + 10);

      alert(`✅ Качество подтверждено!\n+10 $AUTO токенов\n\nДорога: ${selectedRoad.name}\nКачество: ${selectedRoad.quality === 'good' ? 'Хорошее' : selectedRoad.quality === 'medium' ? 'Среднее' : 'Плохое'}`);
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Ошибка при подписании сообщения');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="w-80 bg-dark-card border-r border-dark-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold mb-2">AutostradAI</h1>
        <p className="text-sm text-gray-400">DePIN навигатор на Solana</p>
      </div>

      {/* Wallet Connection */}
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-sm font-semibold mb-3">Кошелек</h2>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-10 !text-sm" />

        {publicKey && (
          <div className="mt-3 p-3 bg-dark-bg rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Адрес:</p>
            <p className="text-xs font-mono break-all">{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}</p>
          </div>
        )}
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
              disabled={!publicKey || isConfirming}
              className="w-full mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {isConfirming ? 'Подтверждение...' : '✓ Подтвердить качество'}
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
  );
}
