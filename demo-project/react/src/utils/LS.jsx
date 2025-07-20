import React, { Component } from "react"
import { localizedENString, localizedString } from "../localized/util"
import { connect } from "react-redux"
import I18n from "../localized/i18n"

export default function LS(WrappedComponent) {
    class HOC extends Component {
        constructor(props) {
            super(props)
            this.state = {
                currentLanguage: I18n.language
            }
        }

        componentDidMount() {
            // 监听语言变化
            I18n.on('languageChanged', this.handleLanguageChange)
        }

        componentWillUnmount() {
            // 移除监听器
            I18n.off('languageChanged', this.handleLanguageChange)
        }

        handleLanguageChange = (newLanguage) => {
            this.setState({ currentLanguage: newLanguage })
        }

        render() {
            let data = {
                $LS: function (...args) {
                    return localizedString(...args)
                },
                ...this.props,
            }
            return (
                <>
                    <WrappedComponent {...data} />
                </>
            )
        }
    }

    return connect()(HOC)
}
export const LS_EN = WrappedComponent => {
    class HOC extends Component {
        render() {
            let data = {
                $LS: function (...args) {
                    return localizedENString(...args)
                },
                ...this.props,
            }
            return (
                <>
                    <WrappedComponent {...data} />
                </>
            )
        }
    }

    return connect()(HOC)
}
