const app = getApp();

Page({
  data: {
    jsonText: ""
  },
  // 单个单词录入
  onSingleSubmit(e) {
    const formData = e.detail.value;
    const newWord = {
      ...formData,
      mastered: false,
      intervalIndex: 0, // 初始复习计划索引
      nextReview: Date.now()  // 立即开始复习
    };
    const app = getApp();
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    wordList.push(newWord);
    wx.setStorageSync(app.globalData.STORAGE_KEY, wordList);
    wx.showToast({
      title: '录入成功',
      icon: 'success'
    });
    // 清空表单（如果需要，可调用 form.reset() ）
  },
  // 更新 jsonText 数据绑定
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
    // 给每个单词增加复习计划相关字段
    words = words.map(item => ({
      ...item,
      mastered: false,
      intervalIndex: 0,
      nextReview: Date.now()
    }));
    // 读取现有数据并合并
    const app = getApp();
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
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
