import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaGlobeAmericas } from 'react-icons/fa';
import '../styles/LanguageToggle.css';

function LanguageToggle({ hideMobileIcon = false }) {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const isEnglish = i18n.language === 'en';
  const isHindi = i18n.language === 'hi';

  return (
    <div className="language-toggle-container">
      <FaGlobeAmericas className={`language-toggle-icon text-light ${hideMobileIcon ? 'd-none d-lg-block' : ''}`} size={16} />
      <ButtonGroup size="sm">
        <Button
          variant={isEnglish ? "light" : "outline-light"}
          onClick={() => changeLanguage('en')}
          className="px-2 py-1"
          style={{ 
            fontSize: '0.875rem',
            minWidth: '35px',
            fontWeight: isEnglish ? 'bold' : 'normal'
          }}
        >
          EN
        </Button>
        <Button
          variant={isHindi ? "light" : "outline-light"}
          onClick={() => changeLanguage('hi')}
          className="px-2 py-1"
          style={{ 
            fontSize: '0.875rem',
            minWidth: '35px',
            fontWeight: isHindi ? 'bold' : 'normal'
          }}
        >
          हिं
        </Button>
      </ButtonGroup>
    </div>
  );
}

export default LanguageToggle; 