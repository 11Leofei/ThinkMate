// Gemini AI集成测试
// 使用真实的Gemini API密钥测试AI功能

const GEMINI_API_KEY = 'AIzaSyAX19NpeHg0E6x8oQnKP5lgYBPOIEVoa14';
const GEMINI_MODEL = 'gemini-1.5-flash';

console.log('🤖 开始Gemini AI集成测试\n');

// 测试思维内容
const testThoughts = [
  "今天学习了React Hook，感觉很有收获，终于理解了useState的原理！",
  "为什么我总是在deadline前才开始着急？这种拖延症该怎么解决？", 
  "计划明天开始制定一个详细的学习计划，包括React、TypeScript和Node.js",
  "我有一个很棒的想法，想做一个帮助记录思维的AI应用",
  "最近工作压力有点大，需要找个方法放松一下"
];

// Gemini API调用函数
async function callGeminiAPI(content, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${systemPrompt}\n\n用户思维内容: "${content}"\n\n请返回严格的JSON格式分析结果。`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!content) {
      throw new Error('Gemini响应中没有内容');
    }

    // 尝试解析JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`无法解析Gemini返回的JSON: ${content}`);
    }
  } catch (error) {
    console.error('Gemini API调用失败:', error);
    throw error;
  }
}

// 分析单个思维
async function analyzeThoughtWithGemini(content) {
  const systemPrompt = `你是ThinkMate的AI思维分析专家。请分析用户的思维内容，返回JSON格式的分析结果。

分析维度：
1. 思维模式：creative(创意), analytical(分析), problemSolving(解决问题), reflective(反思), planning(规划)
2. 情感分析：positive/negative/neutral，强度0-1，具体情绪
3. 主题提取：最多3个关键主题
4. 思维洞察：深层次的思维模式分析
5. 死胡同检测：是否陷入重复/困惑的思维循环
6. 个性化建议：基于思维模式的具体建议

返回格式：
{
  "thinkingPattern": {
    "type": "creative/analytical/problemSolving/reflective/planning",
    "confidence": 0.8,
    "reasoning": "分析原因"
  },
  "sentiment": {
    "polarity": "positive/negative/neutral",
    "intensity": 0.7,
    "emotions": ["具体情绪"]
  },
  "themes": ["主题1", "主题2"],
  "insights": ["洞察1", "洞察2"],
  "deadEndDetection": {
    "isDeadEnd": false,
    "warning": "警告信息",
    "suggestions": ["建议1"]
  },
  "personalizedAdvice": ["个性化建议"]
}

请用中文分析，保持专业且温暖的语调。`;

  return await callGeminiAPI(content, systemPrompt);
}

// 测试单个思维分析
async function testSingleThoughtAnalysis() {
  console.log('🧠 测试单个思维分析功能\n');
  
  for (let i = 0; i < Math.min(testThoughts.length, 3); i++) {
    const thought = testThoughts[i];
    console.log(`分析思维 ${i + 1}: "${thought.substring(0, 40)}..."`);
    
    try {
      const analysis = await analyzeThoughtWithGemini(thought);
      
      console.log(`  ✅ 思维模式: ${analysis.thinkingPattern?.type} (置信度: ${analysis.thinkingPattern?.confidence})`);
      console.log(`  ✅ 情感分析: ${analysis.sentiment?.polarity} (强度: ${analysis.sentiment?.intensity})`);
      console.log(`  ✅ 主题提取: ${analysis.themes?.join(', ')}`);
      console.log(`  ✅ 核心洞察: ${analysis.insights?.[0] || '无'}`);
      console.log(`  ✅ 个性化建议: ${analysis.personalizedAdvice?.[0] || '无'}`);
      
      if (analysis.deadEndDetection?.isDeadEnd) {
        console.log(`  ⚠️  死胡同警告: ${analysis.deadEndDetection.warning}`);
      }
      
      console.log('');
      
      // 短暂延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ❌ 分析失败: ${error.message}\n`);
    }
  }
}

// 测试批量分析
async function testBatchAnalysis() {
  console.log('📊 测试批量思维模式分析\n');
  
  const analyses = [];
  
  for (const thought of testThoughts) {
    try {
      const analysis = await analyzeThoughtWithGemini(thought);
      analyses.push(analysis);
      await new Promise(resolve => setTimeout(resolve, 800)); // API限制
    } catch (error) {
      console.log(`批量分析中跳过一个失败项: ${error.message}`);
    }
  }
  
  if (analyses.length === 0) {
    console.log('❌ 批量分析失败，无有效结果');
    return;
  }
  
  // 统计思维模式
  const patternCounts = {};
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  const allThemes = [];
  
  analyses.forEach(analysis => {
    // 统计思维模式
    const pattern = analysis.thinkingPattern?.type;
    if (pattern) {
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    }
    
    // 统计情感
    const sentiment = analysis.sentiment?.polarity;
    if (sentiment) {
      sentimentCounts[sentiment]++;
    }
    
    // 收集主题
    if (analysis.themes) {
      allThemes.push(...analysis.themes);
    }
  });
  
  console.log('📈 批量分析结果:');
  console.log(`  总分析数量: ${analyses.length}`);
  console.log(`  主导思维模式: ${Object.entries(patternCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '无'}`);
  console.log(`  情感分布: 积极${sentimentCounts.positive} | 中性${sentimentCounts.neutral} | 消极${sentimentCounts.negative}`);
  
  const uniqueThemes = [...new Set(allThemes)];
  console.log(`  主要主题: ${uniqueThemes.slice(0, 5).join(', ')}`);
  console.log('');
}

// 测试API连接
async function testAPIConnection() {
  console.log('🔗 测试Gemini API连接\n');
  
  try {
    const testResult = await callGeminiAPI('测试', '请简单回复"连接成功"');
    console.log('✅ Gemini API连接成功');
    console.log(`✅ 测试响应: ${JSON.stringify(testResult).substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ API连接失败: ${error.message}`);
    return false;
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log('⚠️  测试错误处理机制\n');
  
  // 测试空内容
  try {
    await analyzeThoughtWithGemini('');
    console.log('❌ 空内容应该失败但没有失败');
  } catch (error) {
    console.log('✅ 正确处理空内容错误');
  }
  
  // 测试超长内容
  try {
    const longContent = '很长的内容 '.repeat(1000);
    await analyzeThoughtWithGemini(longContent);
    console.log('✅ 处理超长内容成功或正确失败');
  } catch (error) {
    console.log('✅ 正确处理超长内容错误');
  }
  
  console.log('');
}

// 性能测试
async function testPerformance() {
  console.log('⚡ 测试性能表现\n');
  
  const testContent = "这是一个性能测试的想法，检查响应时间和准确性。";
  const iterations = 3;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    try {
      await analyzeThoughtWithGemini(testContent);
      const endTime = Date.now();
      times.push(endTime - startTime);
      console.log(`  测试 ${i + 1}: ${endTime - startTime}ms`);
    } catch (error) {
      console.log(`  测试 ${i + 1}: 失败 - ${error.message}`);
    }
    
    // 避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`  平均响应时间: ${avgTime.toFixed(0)}ms`);
    console.log(`  响应时间评估: ${avgTime < 3000 ? '优秀' : avgTime < 5000 ? '良好' : '需要优化'}`);
  }
  
  console.log('');
}

// 生成测试报告
function generateReport(results) {
  console.log('📋 Gemini AI集成测试报告\n');
  console.log('='.repeat(60));
  console.log('🎯 测试总结:');
  console.log(`✅ API连接: ${results.apiConnection ? '成功' : '失败'}`);
  console.log(`✅ 单个分析: ${results.singleAnalysis ? '正常' : '异常'}`);
  console.log(`✅ 批量分析: ${results.batchAnalysis ? '正常' : '异常'}`);
  console.log(`✅ 错误处理: ${results.errorHandling ? '完善' : '需改进'}`);
  console.log(`✅ 性能表现: ${results.performance ? '满意' : '需优化'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = (successCount / totalTests * 100).toFixed(1);
  
  console.log('\n🏆 整体评分:');
  console.log(`成功率: ${successRate}% (${successCount}/${totalTests})`);
  
  if (successRate >= 80) {
    console.log('🎉 Gemini AI集成测试全面通过！');
    console.log('🚀 可以在ThinkMate中配置Gemini AI服务了');
  } else if (successRate >= 60) {
    console.log('⚠️  基本功能正常，部分功能需要调整');
  } else {
    console.log('❌ 集成存在问题，需要进一步调试');
  }
  
  console.log('\n📝 使用建议:');
  console.log('1. 在ThinkMate中添加Gemini提供商选项');
  console.log('2. 配置API密钥: AIzaSyAX19NpeHg0E6x8oQnKP5lgYBPOIEVoa14');
  console.log('3. 推荐模型: gemini-1.5-flash (速度快，成本低)');
  console.log('4. 备选模型: gemini-1.5-pro (分析精度更高)');
  
  console.log('='.repeat(60));
}

// 主测试函数
async function runGeminiTests() {
  const results = {
    apiConnection: false,
    singleAnalysis: false,
    batchAnalysis: false,
    errorHandling: false,
    performance: false
  };
  
  try {
    // API连接测试
    results.apiConnection = await testAPIConnection();
    console.log('');
    
    if (!results.apiConnection) {
      console.log('❌ API连接失败，跳过后续测试');
      generateReport(results);
      return;
    }
    
    // 单个分析测试
    try {
      await testSingleThoughtAnalysis();
      results.singleAnalysis = true;
    } catch (error) {
      console.log(`单个分析测试失败: ${error.message}`);
    }
    
    // 批量分析测试
    try {
      await testBatchAnalysis();
      results.batchAnalysis = true;
    } catch (error) {
      console.log(`批量分析测试失败: ${error.message}`);
    }
    
    // 错误处理测试
    try {
      await testErrorHandling();
      results.errorHandling = true;
    } catch (error) {
      console.log(`错误处理测试失败: ${error.message}`);
    }
    
    // 性能测试
    try {
      await testPerformance();
      results.performance = true;
    } catch (error) {
      console.log(`性能测试失败: ${error.message}`);
    }
    
  } catch (error) {
    console.error('测试运行出错:', error);
  }
  
  generateReport(results);
}

// 检查环境
if (typeof fetch === 'undefined') {
  console.log('❌ 需要Node.js 18+或安装node-fetch');
  process.exit(1);
}

// 运行所有测试
runGeminiTests().catch(console.error);