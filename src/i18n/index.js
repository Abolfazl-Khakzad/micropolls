import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import it from './it.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it }
    },
    lng: localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

export default i18n;
