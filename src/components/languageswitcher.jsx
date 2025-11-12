import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = lang => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => changeLang('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLang('it')}
        className={`px-2 py-1 rounded ${i18n.language === 'it' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
      >
        IT
      </button>
    </div>
  );
}
