import { LANG_TYPE } from "./language_types"
import { message as zhMessages } from "./strings/zh_hans"
import { message as enMessages } from "./strings/en"

// 简化的i18n实现，不依赖i18next
let messages = {
    [LANG_TYPE.ZH_HANS]: zhMessages,
    [LANG_TYPE.EN]: enMessages,
}

// 当前语言
let currentLanguage = LANG_TYPE.ZH_HANS

// 语言变化监听器
let languageChangeListeners = []

// 简单的i18n对象
const i18n = {
    // 获取当前语言
    get language() {
        return currentLanguage
    },

    // 切换语言
    changeLanguage: (lng) => {
        const oldLanguage = currentLanguage
        currentLanguage = lng

        // 通知所有监听器
        languageChangeListeners.forEach(listener => {
            try {
                listener(lng, oldLanguage)
            } catch (error) {
                console.error('Language change listener error:', error)
            }
        })

        return Promise.resolve()
    },

    // 添加语言变化监听器
    on: (event, callback) => {
        if (event === 'languageChanged') {
            languageChangeListeners.push(callback)
        }
    },

    // 移除语言变化监听器
    off: (event, callback) => {
        if (event === 'languageChanged') {
            const index = languageChangeListeners.indexOf(callback)
            if (index > -1) {
                languageChangeListeners.splice(index, 1)
            }
        }
    },

    // 获取翻译文本
    t: (key) => {
        const currentMessages = messages[currentLanguage] || messages[LANG_TYPE.EN]
        return currentMessages[key] || key
    },

    // 获取所有消息
    getMessages: (lng) => {
        return messages[lng || currentLanguage] || messages[LANG_TYPE.EN]
    }
}

export default i18n
