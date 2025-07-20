import React from 'react'
import {useTranslationI18n} from "../hooks/useTranslationI18n.jsx";
import { Globe, Zap, Heart, Shield } from 'lucide-react'

const HookDemo = ()=>{
    const $LS = useTranslationI18n()

    return (
        <div className="hook-demo-component">
            <div className="component-header">
                <h2>{$LS("演示页面")}</h2>
                <p>{$LS("切换语言")}</p>
            </div>

            <div className="demo-grid">
                <div className="demo-card">
                    <Globe className="demo-icon" />
                    <h3>{$LS("成功！")}</h3>
                    <p>{$LS("关于")}</p>
                </div>

                <div className="demo-card">
                    <Zap className="demo-icon" />
                    <h3>{$LS("发生错误")}</h3>
                    <p>{$LS("产品")}</p>
                </div>

                <div className="demo-card">
                    <Heart className="demo-icon" />
                    <h3>{$LS("退出登录")}</h3>
                    <p>{$LS("保存")}</p>
                </div>

                <div className="demo-card">
                    <Shield className="demo-icon" />
                    <h3>{$LS("取消")}</h3>
                    <p>{$LS("重置")}</p>
                </div>
            </div>

            <div className="status-demo">
                <h3>Status Messages with Hook Pattern</h3>
                <div className="status-list">
                    <div className="status-item success">
                        ✅ {$LS("成功！")}
                    </div>
                    <div className="status-item loading">
                        ⏳ {$LS("加载中...")}
                    </div>
                    <div className="status-item error">
                        ❌ {$LS("发生错误")}
                    </div>
                </div>
            </div>

            <div className="navigation-demo">
                <h3>Navigation Items</h3>
                <nav className="demo-nav">
                    <a href="#" className="nav-item">{$LS("首页")}</a>
                    <a href="#" className="nav-item">{$LS("关于")}</a>
                    <a href="#" className="nav-item">{$LS("联系我们")}</a>
                    <a href="#" className="nav-item">{$LS("产品")}</a>
                    <a href="#" className="nav-item">{$LS("个人资料")}</a>
                </nav>
            </div>

            <div className="missing-demo">
                <h3>More Missing Translations</h3>
                <p>{$LS("这个文本在Text2组件中缺失")}</p>
                <p>{$LS("Hook模式的缺失文本")}</p>
                <p>{"Another hardcoded string in Text2"}</p>
            </div>
        </div>
    )
}
export default HookDemo
