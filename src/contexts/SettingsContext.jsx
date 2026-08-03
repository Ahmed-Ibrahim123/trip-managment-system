import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    // Initialize from localStorage or fallback to defaults
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app_theme') || 'light';
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_lang') || 'en';
    });

    // Handle Theme Changes
    useEffect(() => {
        localStorage.setItem('app_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Handle Language / RTL Changes
    useEffect(() => {
        localStorage.setItem('app_lang', language);
        
        if (language === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            document.title = "مدير رحلات يلا نفصل";
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
            document.title = "Yalla Nefsel Trip Manager";
        }
    }, [language]);

    // Translation function
    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    return (
        <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, t, toggleTheme, toggleLanguage }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
