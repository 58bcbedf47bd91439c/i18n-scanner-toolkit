import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import I18n from "./../localized/i18n.js"
import { settingSlice } from "./../redux/slice/setting.slice"
import { LANG_TYPE } from "../localized/language_types"

const LanguageSwitcher = () => {
  const dispatch = useDispatch()
  const { i18nextLng } = useSelector(s => s.setting)
  const [currentLang, setCurrentLang] = useState(i18nextLng || LANG_TYPE.ZH_HANS)

  // 初始化语言设置
  useEffect(() => {
    if (!i18nextLng) {
      dispatch(settingSlice.actions.setI18nextLng({ lng: LANG_TYPE.ZH_HANS }))
    } else {
      setCurrentLang(i18nextLng)
      I18n.changeLanguage(i18nextLng)
    }
  }, [i18nextLng, dispatch])

  const handleLanguageChange = (languageCode) => {
    console.log('Switching language to:', languageCode)

    // 更新i18n
    I18n.changeLanguage(languageCode)

    // 更新Redux状态
    dispatch(settingSlice.actions.setI18nextLng({ lng: languageCode }))

    // 更新本地状态
    setCurrentLang(languageCode)
  };

  return (
    <div className="language-switcher">
      <div className="language-buttons">
        <button
          className={`language-btn ${currentLang === LANG_TYPE.ZH_HANS ? 'active' : ''}`}
          onClick={() => handleLanguageChange(LANG_TYPE.ZH_HANS)}
        >
          🇨🇳 中文
        </button>
        <button
          className={`language-btn ${currentLang === LANG_TYPE.EN ? 'active' : ''}`}
          onClick={() => handleLanguageChange(LANG_TYPE.EN)}
        >
          🇺🇸 English
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
