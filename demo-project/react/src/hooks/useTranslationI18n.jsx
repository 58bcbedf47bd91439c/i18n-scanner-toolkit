import { useState, useEffect } from "react"
import { localizedString } from "../localized/util"
import I18n from "../localized/i18n"

export const useTranslationI18n = () => {
    const [currentLanguage, setCurrentLanguage] = useState(I18n.language)

    useEffect(() => {
        const handleLanguageChange = (newLanguage) => {
            setCurrentLanguage(newLanguage)
        }

        // 监听语言变化
        I18n.on('languageChanged', handleLanguageChange)

        // 清理函数
        return () => {
            I18n.off('languageChanged', handleLanguageChange)
        }
    }, [])

    // 返回一个函数，该函数会使用当前语言进行翻译
    return (key) => {
        return localizedString(key)
    }
}
