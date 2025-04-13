const app = getApp();
const config = require("../../config.js"); // 引入配置文件

Page({
  data: {
    jsonText: "",
    isLoading: false, // 显示生成过程的加载状态
  },
  // 单个单词录入
  onSingleSubmit(e) {
    const formData = e.detail.value;
    const newWord = {
      ...formData,
      mastered: false,
      intervalIndex: 0,
      nextReview: Date.now()
    };
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    wordList.push(newWord);
    wx.setStorageSync(app.globalData.STORAGE_KEY, wordList);
    wx.showToast({
      title: '录入成功',
      icon: 'success'
    });
  },
  // 批量导入 JSON 文本
  onBatchImport() {
    const { jsonText } = this.data;
    let words;
    try {
      words = JSON.parse(jsonText);
      if (!Array.isArray(words)) {
        throw new Error("JSON 需为数组格式");
      }
    } catch (err) {
      wx.showToast({
        title: 'JSON 格式错误',
        icon: 'none'
      });
      return;
    }
    words = this.initializeWords(words);
    this.saveWords(words);
  },
  // 初始化单词的额外字段
  initializeWords(words) {
    return words.map(item => ({
      ...item,
      mastered: false,
      intervalIndex: 0,
      nextReview: Date.now()
    }));
  },
  // 保存单词到本地存储
  saveWords(newWords) {
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    const existingWords = new Set(wordList.map(item => item.word));
    const filteredWords = newWords.filter(item => !existingWords.has(item.word));
    if (filteredWords.length === 0) {
      wx.showToast({
        title: 'No new words to import',
        icon: 'none'
      });
      this.setData({ jsonText: "" });
      return;
    }
    wordList = wordList.concat(filteredWords);
    wx.setStorageSync(app.globalData.STORAGE_KEY, wordList);
    wx.showToast({
      title: '批量录入成功',
      icon: 'success'
    });
    this.setData({ jsonText: "" });
  },
  // 新增：生成单词
  onGenerateWords() {
    const geminiKey = config.geminiKey;

    if (!geminiKey) {
      wx.showToast({
        title: 'API 密钥未配置',
        icon: 'none'
      });
      return;
    }
    this.setData({ isLoading: true }); // 显示加载状态
    wx.request({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      data: {
        contents: [{
          parts: [{ text: "Generate 20 IELTS vocabulary words in the following format：[{\"word\":\"abundant\",\"part_of_speech\":\"adj.\",\"phonetic\":\"[ əˈbʌndənt ]\",\"translation\":\"大量的；丰富的\",\"example_sentence\":\"Water is abundant in this region.\",\"example_translation\":\"这个地区水资源丰富。\"}]"}]
        }]
      },
      success: (res) => {
        try {
          // 解析 API 响应结果
          const rawText = res.data.candidates[0].content.parts[0].text;
          const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            const words = JSON.parse(jsonMatch[1]);
            const initializedWords = this.initializeWords(words);
            this.saveWords(initializedWords);
          } else {
            throw new Error("无法解析生成结果");
          }
        } catch (err) {
          wx.showToast({
            title: '生成单词解析失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '生成单词失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false }); // 隐藏加载状态
      }
    });
  },
  // 跳转到查看词库页面
  goToVocab() {
    wx.navigateTo({
      url: '/pages/vocab/vocab'
    });
  },
  // 跳转到学习页面
  goToStudy() {
    wx.navigateTo({
      url: '/pages/study/study'
    });
  }
});