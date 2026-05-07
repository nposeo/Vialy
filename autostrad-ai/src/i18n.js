import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ua from './locales/ua.json';
import en from './locales/en.json';

const resources = {
  ua: ua,
  en: en,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ua', // default language
    fallbackLng: 'ua',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
