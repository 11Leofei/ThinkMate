import { useState } from 'react'
import { t, getCurrentLanguage, setLanguage, Language, TranslationKey } from '@/lib/i18n'

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage())

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    setCurrentLang(lang)
  }

  // 响应式翻译函数
  const translate = (key: TranslationKey): string => {
    return t(key)
  }

  return {
    t: translate,
    currentLanguage: currentLang,
    changeLanguage,
  }
}