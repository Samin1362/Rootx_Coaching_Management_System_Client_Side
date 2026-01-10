import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  const currentLanguage = i18n.language || "en";
  const isEnglish = currentLanguage === "en";

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-circle btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95"
      title={
        isEnglish ? "Switch to Bangla (বাংলা)" : "Switch to English (ইংরেজি)"
      }
    >
      <div className="flex items-center justify-center">
        <MdLanguage className="text-xl sm:text-2xl" />
        <span className="ml-1 text-xs font-bold">
          {isEnglish ? "বাং" : "EN"}
        </span>
      </div>
    </button>
  );
};

export default LanguageSwitcher;
