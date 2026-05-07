import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';

export default function Sidebar({ routingMode, setRoutingMode, selectedRoad, rewards, setRewards }) {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();
  const { t, i18n } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleConfirmQuality = async () => {
    if (!publicKey || !signMessage || !selectedRoad) {
      alert(t('alerts.connectWallet'));
      return;
    }

    setIsConfirming(true);

    try {
      const roadName = selectedRoad.properties?.name || selectedRoad.name || 'Неизвестная дорога';
      const roadQuality = selectedRoad.properties?.quality || selectedRoad.quality || 'medium';
      const coords = selectedRoad.coordinates;

      // Создаем сообщение для подписи
      const message = new TextEncoder().encode(
        `Vialy Quality Confirmation\nRoad: ${roadName}\nQuality: ${roadQuality}\nCoordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}\nTimestamp: ${Date.now()}`
      );

      // Подписываем сообщение
      const signature = await signMessage(message);
      const signatureBase64 = btoa(String.fromCharCode(...signature));

      console.log('Signature:', signature);
      console.log('Message signed successfully');

      // Отправляем на backend для сохранения баланса
      const result = await api.confirmQuality(
        publicKey.toString(),
        roadName,
        roadQuality,
        signatureBase64
      );

      if (result.success) {
        // Обновляем баланс из ответа backend
        setRewards(result.balance);

        const qualityText = roadQuality === 'good' ? t('selectedRoad.good') :
                           roadQuality === 'medium' ? t('selectedRoad.medium') :
                           t('selectedRoad.bad');

        alert(t('alerts.qualityConfirmed', {
          reward: result.reward,
          roadName: roadName,
          quality: qualityText
        }));
      } else {
        throw new Error('Failed to confirm quality');
      }
    } catch (error) {
      console.error('Error confirming quality:', error);
      alert(t('alerts.errorConfirming'));
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="w-80 bg-dark-card border-r border-dark-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          {/* Language Switcher */}
          <div className="flex gap-1">
            <button
              onClick={() => changeLanguage('ua')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                i18n.language === 'ua' ? 'bg-purple-600 text-white' : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
              }`}
              title="Українська"
            >
              🇺🇦 UA
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                i18n.language === 'en' ? 'bg-purple-600 text-white' : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400">{t('app.subtitle')}</p>
      </div>

      {/* Wallet Connection */}
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-sm font-semibold mb-3">{t('wallet.title')}</h2>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-10 !text-sm" />

        {publicKey && (
          <div className="mt-3 p-3 bg-dark-bg rounded-lg">
            <p className="text-xs text-gray-400 mb-1">{t('wallet.address')}</p>
            <p className="text-xs font-mono break-all">{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}</p>
          </div>
        )}
      </div>

      {/* Routing Mode */}
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-sm font-semibold mb-3">{t('routing.title')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setRoutingMode('fast')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              routingMode === 'fast'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
            }`}
          >
            {t('routing.fast')}
          </button>
          <button
            onClick={() => setRoutingMode('comfort')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              routingMode === 'comfort'
                ? 'bg-green-600 text-white'
                : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
            }`}
          >
            {t('routing.comfort')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {routingMode === 'fast' ? t('routing.fastDesc') : t('routing.comfortDesc')}
        </p>
      </div>

      {/* Selected Road Info */}
      {selectedRoad && (
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-sm font-semibold mb-3">{t('selectedRoad.title')}</h2>
          <div className="bg-dark-bg rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs text-gray-400">{t('selectedRoad.name')}</p>
              <p className="text-sm font-medium">{selectedRoad.properties?.name || selectedRoad.name || 'Неизвестная дорога'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('selectedRoad.quality')}</p>
              <p className={`text-sm font-medium ${
                (selectedRoad.properties?.quality || selectedRoad.quality) === 'good' ? 'text-green-500' :
                (selectedRoad.properties?.quality || selectedRoad.quality) === 'medium' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {(selectedRoad.properties?.quality || selectedRoad.quality) === 'good' ? t('selectedRoad.good') :
                 (selectedRoad.properties?.quality || selectedRoad.quality) === 'medium' ? t('selectedRoad.medium') :
                 t('selectedRoad.bad')}
              </p>
            </div>
            <button
              onClick={handleConfirmQuality}
              disabled={!publicKey || isConfirming}
              className="w-full mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {isConfirming ? t('selectedRoad.confirming') : t('selectedRoad.confirmQuality')}
            </button>
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="p-6 mt-auto">
        <h2 className="text-sm font-semibold mb-3">{t('rewards.title')}</h2>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
          <p className="text-xs text-purple-200 mb-1">{t('rewards.balance')}</p>
          <p className="text-3xl font-bold">{rewards} $AUTO</p>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {t('rewards.description')}
        </p>
      </div>
    </div>
  );
}
