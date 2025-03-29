Page({
    data: {},
    onSubmit(e) {
      const formData = e.detail.value;
      // 补充字段：初始状态，复习计划相关
      const newWord = {
        ...formData,
        mastered: false,
        intervalIndex: 0, // 当前处于复习计划中的哪一步
        nextReview: Date.now() // 新录入的单词立即开始学习
      };
      // 获取原有数据
      const app = getApp();
      let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
      
      wordList.push(newWord);
      wx.setStorageSync(getApp().STORAGE_KEY, wordList);
      wx.showToast({
        title: '录入成功',
        icon: 'success'
      });
      // 可选择清空表单或自动跳转到学习页面
      this.setData({});
    }
  });
  