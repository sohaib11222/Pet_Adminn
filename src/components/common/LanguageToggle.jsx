import { useLanguage } from "../../contexts/LanguageContext";
import PropTypes from "prop-types";

const LanguageToggle = ({ className = "" }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const nextLanguage = language === "it" ? t("common.english") : t("common.italian");

  return (
    <button
      type="button"
      className={`admin-language-toggle ${className}`.trim()}
      onClick={toggleLanguage}
      aria-label={t("common.switchTo", { language: nextLanguage })}
      title={t("common.switchTo", { language: nextLanguage })}
    >
      <i className="fa-solid fa-language" aria-hidden="true" />
      <span>{language === "it" ? "IT" : "EN"}</span>
    </button>
  );
};

LanguageToggle.propTypes = {
  className: PropTypes.string,
};

export default LanguageToggle;
