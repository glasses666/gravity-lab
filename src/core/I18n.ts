import * as Locales from '../locales/index';

// Map lang codes to native names for UI display
export const languageNames: Record<string, string> = {
    en: "English",
    zh: "简体中文",
    ja: "日本語",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ru: "Русский",
    pt: "Português",
    ko: "한국어",
    it: "Italiano",
    hi: "हिन्दी",
    ar: "العربية",
    tr: "Türkçe",
    vi: "Tiếng Việt",
    th: "ไทย",
    id: "Bahasa Indonesia",
    nl: "Nederlands",
    pl: "Polski"
};

export type LocaleKey = keyof typeof Locales;
type LocaleData = typeof Locales.en;

export class I18n {
    currentLocale: LocaleKey = 'en';
    data: LocaleData = Locales.en;
    
    private listeners: Function[] = [];

    constructor() {
        // Try to match full 'en-US' or just 'en'
        const browserLang = navigator.language.toLowerCase();
        const shortLang = browserLang.split('-')[0];
        
        if (Object.keys(Locales).includes(shortLang)) {
            this.setLocale(shortLang as LocaleKey);
        }
    }

    setLocale(lang: LocaleKey) {
        if (Locales[lang]) {
            this.currentLocale = lang;
            this.data = Locales[lang];
            this.updateDOM();
            this.notifyListeners();
            
            // Handle RTL for Arabic
            if (lang === 'ar') {
                document.body.style.direction = 'rtl';
                document.body.style.textAlign = 'right';
            } else {
                document.body.style.direction = 'ltr';
                document.body.style.textAlign = 'left';
            }
        }
    }

    get(key: keyof LocaleData): string {
        return this.data[key] || key;
    }

    updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n') as keyof LocaleData;
            if (key && this.data[key]) {
                el.textContent = this.data[key];
            }
        });
    }

    onChange(callback: Function) {
        this.listeners.push(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb());
    }
}

export const i18n = new I18n();
