import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { languageNames, rtlLanguages } from '@/i18n/locales';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher = ({ isMobile = false }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    const isRtl = rtlLanguages.includes(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2 mt-4">
        <span className="text-gray-400 text-sm font-semibold uppercase px-4">Select Language</span>
        <div className="grid grid-cols-2 gap-2 px-4">
          {Object.entries(languageNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`text-sm py-2 px-3 rounded-md text-left transition-colors ${
                i18n.language === code
                  ? 'bg-[#4ADE80] text-[#1F4D3D] font-bold'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-gray-300 hover:text-white focus:outline-none">
        <Globe size={18} />
        <span className="text-sm font-medium uppercase">{i18n.language?.split('-')[0]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="h-[300px] overflow-y-auto bg-[#2D3436] border-gray-700 text-gray-200">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white flex justify-between items-center"
          >
            <span>{name}</span>
            {i18n.language === code && <Check size={14} className="text-[#4ADE80]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;