import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function CustomWalletButton() {
  const { publicKey, disconnect, select, wallets, connect } = useWallet();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);

  // Если кошелек не подключен, показываем кнопку подключения
  if (!publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowWalletList(!showWalletList)}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg h-10 px-4 text-sm font-medium text-white transition-colors w-full"
        >
          {t('wallet.connect')}
        </button>

        {showWalletList && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowWalletList(false)}
            />
            <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-dark-border">
                <p className="text-sm font-semibold text-white">{t('wallet.selectWallet')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('wallet.connectDescription')}</p>
              </div>
              {wallets.filter(wallet => wallet.readyState === 'Installed' || wallet.readyState === 'Loadable').map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={async () => {
                    try {
                      select(wallet.adapter.name);
                      await connect();
                      setShowWalletList(false);
                    } catch (error) {
                      console.error('Failed to connect:', error);
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-dark-border transition-colors flex items-center gap-3"
                >
                  {wallet.adapter.icon && (
                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-6 h-6" />
                  )}
                  <span>{wallet.adapter.name}</span>
                </button>
              ))}
              {wallets.filter(wallet => wallet.readyState === 'NotDetected').length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs text-gray-400 border-t border-dark-border">
                    {t('wallet.moreOptions')}
                  </div>
                  {wallets.filter(wallet => wallet.readyState === 'NotDetected').map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => {
                        window.open(wallet.adapter.url, '_blank');
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-dark-border transition-colors flex items-center gap-3"
                    >
                      {wallet.adapter.icon && (
                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-6 h-6 opacity-50" />
                      )}
                      <span>{wallet.adapter.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Если кошелек подключен, показываем меню с адресом
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-purple-600 hover:bg-purple-700 rounded-lg h-10 px-4 text-sm font-medium text-white transition-colors w-full"
      >
        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowMenu(false);
              setShowWalletList(false);
            }}
          />
          <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
            <button
              onClick={() => {
                setShowWalletList(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-border transition-colors"
            >
              {t('wallet.changeWallet')}
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-border rounded-b-lg transition-colors"
            >
              {t('wallet.disconnect')}
            </button>
          </div>

          {showWalletList && (
            <div className="absolute left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-dark-border">
                <p className="text-sm font-semibold text-white">{t('wallet.selectWallet')}</p>
              </div>
              {wallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={async () => {
                    try {
                      select(wallet.adapter.name);
                      await connect();
                      setShowMenu(false);
                      setShowWalletList(false);
                    } catch (error) {
                      console.error('Failed to connect:', error);
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-dark-border transition-colors flex items-center gap-3"
                >
                  {wallet.adapter.icon && (
                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-6 h-6" />
                  )}
                  {wallet.adapter.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
