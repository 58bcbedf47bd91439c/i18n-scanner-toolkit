import i18n from "./i18n"
import { LANG_TYPE } from "./language_types"

// 简化的文本处理函数
function _removeZHBlank(msg) {
    if (msg) {
        return msg.replace(/～/g, "")
    }
    return msg
}

// 简化的本地化函数 - 直接使用文本作为key
function localizedString(textKey, ...otherArgs) {
    // 直接使用i18n的t方法，它会根据当前语言返回对应翻译
    let msg = i18n.t(textKey)
    console.log(`localizedString: "${textKey}" -> "${msg}" (lang: ${i18n.language})`)
    return _removeZHBlank(msg)
}

// 英文本地化函数
function localizedENString(textKey, ...otherArgs) {
    // 对于英文，也使用相同的逻辑
    let msg = i18n.t(textKey)
    return _removeZHBlank(msg)
}

const getLanguage = language => {
    if (language?.startsWith("zh")) {
        return "zh"
    }
    return language
}
// export default { localizedString, cnKeysReflection }
export { localizedString, getLanguage, localizedENString }
