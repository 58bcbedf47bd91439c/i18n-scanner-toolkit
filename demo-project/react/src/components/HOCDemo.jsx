import React from 'react'
import LS from "../utils/LS.jsx";
import { Star, Users, Settings, Mail } from 'lucide-react'

const HOCDemo = ({$LS})=>{
    return (
        <div className="hoc-demo-component">
            <div className="component-header">
                <h2>{$LS("React 国际化演示")}</h2>
                <p>{$LS("演示 @i18n-toolkit/scanner 功能")}</p>
            </div>

            <div className="demo-grid">
                <div className="demo-card">
                    <Star className="demo-icon" />
                    <h3>{$LS("首页")}</h3>
                    <p>{$LS("这是一个展示自定义 $LS 函数的演示")}</p>
                </div>

                <div className="demo-card">
                    <Users className="demo-icon" />
                    <h3>{$LS("登录")}</h3>
                    <p>{$LS("个人资料")}</p>
                </div>

                <div className="demo-card">
                    <Settings className="demo-icon" />
                    <h3>{$LS("加载中...")}</h3>
                    <p>{$LS("当前语言")}</p>
                </div>

                <div className="demo-card">
                    <Mail className="demo-icon" />
                    <h3>{$LS("邮箱")}</h3>
                    <p>{$LS("联系我们")}</p>
                </div>
            </div>

            <div className="form-demo">
                <h3>Form Demo with HOC Pattern</h3>
                <form>
                    <div className="form-group">
                        <label>{$LS("姓名")}</label>
                        <input type="text" placeholder={$LS("姓名")} />
                    </div>
                    <div className="form-group">
                        <label>{$LS("邮箱")}</label>
                        <input type="email" placeholder={$LS("邮箱")} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {$LS("提交")}
                        </button>
                        <button type="reset" className="btn btn-outline">
                            {$LS("重置")}
                        </button>
                    </div>
                </form>
            </div>

            <div className="missing-demo">
                <h3>Missing Translations (will be detected by scanner)</h3>
                <p>{$LS("这个文本在英文翻译中缺失")}</p>
                <p>{$LS("另一个缺失的文本")}</p>
                <p>{"Hardcoded text in Text1 component"}</p>
            </div>
        </div>
    )
}
export default LS(HOCDemo)
