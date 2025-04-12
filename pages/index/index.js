const app = getApp();

Page({
  data: {
    jsonText: ""
  },
  // 单个单词录入
  onSingleSubmit(e) {
    const formData = e.detail.value;
    // 新录入的单词数据添加艾宾浩斯复习相关字段
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
    // 可选择清空表单或跳转至其他页面
  },
  // 绑定批量导入 textarea 的输入
  onJsonInput(e) {
    this.setData({ jsonText: e.detail.value });
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
    // 给每个单词增加复习相关字段
    words = words.map(item => ({
      ...item,
      mastered: false,
      intervalIndex: 0,
      nextReview: Date.now()
    }));
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    
    // 过滤掉已存在的单词（以 word 字段为唯一标识）
    const existingWords = new Set(wordList.map(item => item.word));
    words = words.filter(item => !existingWords.has(item.word));

    // 如果没有新单词可导入，直接提示并返回
    if (words.length === 0) {
        wx.showToast({
        title: 'No new words to import',
        icon: 'none'
        });
        this.setData({ jsonText: "" });
        return;
    }
    
    wordList = wordList.concat(words);
    wx.setStorageSync(app.globalData.STORAGE_KEY, wordList);
    wx.showToast({
      title: '批量录入成功',
      icon: 'success'
    });
    // 清空文本框
    this.setData({ jsonText: "" });
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
