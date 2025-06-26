# ThinkMate AI功能调试指南

## 问题诊断

如果你已经添加了API密钥但AI功能仍然不工作，请按以下步骤排查：

### 1. 检查AI配置状态
在左侧边栏底部查看AI状态指示器：
- 🟢 绿色 = AI已连接且工作正常
- 🟡 黄色 = AI未配置或配置有问题
- 🔴 红色 = AI连接失败

### 2. 重新配置AI服务

#### 步骤1: 打开AI配置
1. 点击左侧边栏的"设置"按钮
2. 或点击AI状态旁边的"设置"链接

#### 步骤2: 选择AI提供商
- **OpenAI GPT** (推荐): 最精准的分析
- **Claude**: 擅长深度思维分析  
- **本地AI**: 完全私密，需要Ollama

#### 步骤3: 输入正确的API信息
**OpenAI配置:**
```
API密钥: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
模型: gpt-4o-mini (推荐)
```

**Claude配置:**
```
API密钥: sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxx
模型: claude-3-haiku-20240307 (推荐)
```

#### 步骤4: 测试连接
1. 点击"测试连接"按钮
2. 等待验证完成
3. 看到"AI配置验证成功"后保存

### 3. 常见问题解决

#### 问题1: API密钥无效
**错误信息**: "API连接失败，请检查密钥"
**解决方案**:
- 确认API密钥完整复制，没有多余空格
- 检查API密钥是否过期
- 确认账户有足够余额（OpenAI）或额度（Claude）

#### 问题2: 网络连接问题
**错误信息**: "配置验证失败: Network error"
**解决方案**:
- 检查网络连接
- 如果在中国，可能需要VPN
- 尝试切换网络环境

#### 问题3: JSON解析错误
**错误信息**: "AI分析失败"，控制台显示JSON错误
**解决方案**:
- 这通常是AI返回格式问题，会自动降级到本地分析
- 可以尝试重新保存配置

#### 问题4: 本地AI连接失败
**错误信息**: "本地服务地址不能为空"
**解决方案**:
1. 确保已安装Ollama: `brew install ollama`
2. 启动Ollama服务: `ollama serve`  
3. 下载模型: `ollama pull llama3.2`
4. 确认服务地址: `http://localhost:11434`

### 4. 手动验证API
如果仍有问题，可以手动测试API：

#### 测试OpenAI API:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 测试Claude API:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"test"}]}'
```

### 5. 查看详细错误信息
1. 打开浏览器开发者工具（F12）
2. 切换到Console标签页
3. 尝试使用AI功能，查看错误信息
4. 将错误信息反馈给开发者

### 6. 降级模式
如果AI暂时不可用，ThinkMate会自动使用本地分析：
- 基础的情感分析
- 简单的主题识别
- 基本的思维模式检测
- 所有想法仍会正常保存

### 7. 功能测试清单
配置完成后，测试以下功能：

- [ ] 输入一段想法，查看是否有AI实时分析
- [ ] 保存想法后，检查是否有情感分析和主题标签
- [ ] 查看"洞察"页面，确认有AI生成的分析
- [ ] 检查"模式"页面，确认思维模式分析工作

### 8. 性能优化
- 使用GPT-4o-mini而不是GPT-4，速度更快成本更低
- 启用缓存功能减少重复API调用
- 考虑使用本地AI保护隐私

如果以上步骤都无法解决问题，可能是代码层面的bug，请联系开发者。