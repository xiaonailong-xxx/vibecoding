# Enter.pro Credits 充值申请台

这是一个纯前端原型，用来演示学员申请 Credits 和管理员处理申请工单的完整闭环。现在已经接入了 Supabase 数据层，未配置密钥时会自动回退到本地演示数据。

## 当前能力

- 学员端
- 充值申请表单页
- 申请结果页
- 提交后自动跳转结果页
- 刷新查看最新处理状态
- 再次提交新申请

- 管理员端
- 简单邮箱密码登录页
- 申请工单列表页
- 工单按申请时间降序
- 支持状态筛选
- 支持分页，每页 20 条
- 点击工单查看详情
- 支持通过或驳回，并填写处理反馈

## 数据说明

- 已配置 Supabase 时：
- 学员申请单保存到 Supabase 表 `credit_applications`
- 管理员登录使用 Supabase Auth 的邮箱密码登录
- 页面刷新后会重新从 Supabase 拉取数据

- 未配置 Supabase 时：
- 使用浏览器 `localStorage` 保存演示数据
- 可通过页面中的“重置演示数据”恢复默认状态

## 文件

- `index.html`：页面结构
- `styles.css`：视觉样式
- `script.js`：交互逻辑、Supabase 接入和本地回退逻辑
- `public-config.js`：前端公开配置，适合直接部署到 Netlify
- `robots.txt`：基础搜索引擎抓取配置
- `supabase-schema.sql`：Supabase 建表和策略脚本

## 使用方式

1. 在 Supabase 控制台新建项目。
2. 运行 [supabase-schema.sql](/Users/enen/Documents/New%20project/supabase-schema.sql) 里的 SQL。
3. 在 Supabase 的 `Authentication > Users` 中创建一个管理员账号。
4. 如果要换 Supabase 项目，修改 [public-config.js](/Users/enen/Documents/New%20project/public-config.js) 里的公开配置。
5. 打开 `/Users/enen/Documents/New project/index.html` 即可。

## 注意

当前版本仍然是纯前端原型。

- 学员提交申请不需要登录
- 管理员登录走 Supabase Auth
- 为了让学员端能在纯前端里刷新查看申请结果，当前 Supabase 表的读取策略是前端可读的
- `public-config.js` 中只应放前端公开信息，例如 `project URL` 和 `publishable/anon key`
- 绝对不要把 `service_role key` 放进仓库或前端文件

这意味着它适合课程演示和原型验证，但还不适合直接作为正式生产方案上线。

如果你准备上线，建议下一步改成下面两种方案之一：

- 让学员也登录，再用 RLS 严格限制“只能看自己的申请”
- 保留学员免登录，但把查询和更新改到 Supabase Edge Functions 或你自己的后端里

## 参考

- [Supabase JavaScript `select()` 文档](https://supabase.com/docs/reference/javascript/select)
- [Supabase JavaScript `insert()` 文档](https://supabase.com/docs/reference/javascript/insert)
- [Supabase JavaScript `update()` 文档](https://supabase.com/docs/reference/javascript/update)
- [Supabase `signInWithPassword()` 文档](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Supabase RLS 文档](https://supabase.com/docs/guides/database/postgres/row-level-security)
