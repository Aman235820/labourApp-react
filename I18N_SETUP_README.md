# Internationalization (i18n) Setup - InstaHelp

This document explains how internationalization has been implemented in the InstaHelp React application using `react-i18next`.

## 🌐 Features

- **Language Toggle**: Switch between English and Hindi (Hinglish) 
- **Persistent Language**: Selected language is saved in localStorage
- **Dynamic Content**: Text content changes instantly when language is switched
- **Responsive Design**: Language toggle works on both desktop and mobile

## 📁 File Structure

```
src/
├── i18n/
│   ├── i18n.js                 # i18n configuration
│   └── locales/
│       ├── en.json            # English translations
│       └── hi.json            # Hindi translations
├── components/
│   └── LanguageToggle.js      # Language toggle component
└── styles/
    └── LanguageToggle.css     # Styling for language toggle
```

## 🔧 Installation

The following packages have been installed:

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

## 🚀 Usage

### 1. Using Translations in Components

Import and use the `useTranslation` hook:

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.headerTitle')}</h1>
      <p>{t('home.headerTagline')}</p>
    </div>
  );
}
```

### 2. Language Toggle

The language toggle is automatically added to the navigation bar and allows users to switch between:
- **EN** - English
- **हिं** - Hindi (Hinglish)

### 3. Adding New Translations

To add new translations:

1. Add the key-value pair to `src/i18n/locales/en.json`:
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

2. Add the corresponding Hindi translation to `src/i18n/locales/hi.json`:
```json
{
  "newSection": {
    "title": "नया Title",
    "description": "नया Description"
  }
}
```

3. Use in component:
```javascript
<h2>{t('newSection.title')}</h2>
<p>{t('newSection.description')}</p>
```

## 📝 Translation Keys Structure

The translations are organized in nested objects:

- `common.*` - Common UI elements (buttons, labels)
- `navigation.*` - Navigation bar text
- `search.*` - Search functionality
- `home.*` - Home page specific content
- `services.*` - Service names
- `table.*` - Data table headers

## 🎨 Styling

The language toggle has custom CSS for:
- Rounded button design
- Smooth transitions
- Active state highlighting
- Mobile responsiveness

## 📱 Mobile Optimization

The language toggle is optimized for mobile devices with:
- Smaller button sizes
- Adjusted spacing
- Touch-friendly interface

## 🔧 Configuration

The i18n configuration in `src/i18n/i18n.js` includes:

- **Language Detection**: Automatically detects user's preferred language
- **Fallback Language**: English (`en`) is used as fallback
- **Storage**: Selected language is saved in localStorage
- **Debug Mode**: Disabled in production

## 🌍 Adding New Languages

To add a new language (e.g., Spanish):

1. Create `src/i18n/locales/es.json`
2. Add translations in the same structure as existing files
3. Update `src/i18n/i18n.js` to include the new language:

```javascript
import esTranslations from './locales/es.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  es: { translation: esTranslations }  // Add new language
};
```

4. Update `LanguageToggle.js` to include the new language option

## 🐛 Troubleshooting

**Issue**: Translations not appearing
- Check if the translation key exists in both language files
- Verify the key path is correct (e.g., `home.title` not `home.Title`)
- Ensure `useTranslation` hook is imported and used correctly

**Issue**: Language not persisting
- Check browser's localStorage for `i18nextLng` key
- Verify `i18next-browser-languagedetector` is properly configured

**Issue**: Components not re-rendering on language change
- Ensure components using translations are wrapped with `useTranslation` hook
- Check if the component is properly subscribing to i18n changes

## ✅ Currently Translated Components

- ✅ Navigation bar
- ✅ Home page header
- ✅ Search functionality  
- ✅ Data table columns
- ✅ Call-to-action buttons
- ✅ Common UI elements

## 🔮 Future Enhancements

- Add more languages (Gujarati, Marathi, Tamil)
- Implement right-to-left (RTL) support for applicable languages
- Add date/time formatting based on locale
- Implement number formatting for currency and ratings
- Add translation management system for easier content updates

---

Created for InstaHelp - Labour Services Platform 