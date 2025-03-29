const app = getApp();

Page({
  data: {
    wordList: []
  },
  onLoad() {
    this.loadWordList();
  },
  loadWordList() {
    // 从 storage 获取数据并按字母排序
    let words = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    words.sort((a, b) => a.word.localeCompare(b.word));
    // 为每个单词添加 expanded 属性，初始为 false
    words = words.map(item => ({
      ...item,
      expanded: false
    }));
    this.setData({ wordList: words });
  },
  // 切换展开/收起详情
  toggleDetails(e) {
    const wordKey = e.currentTarget.dataset.word;
    const updatedList = this.data.wordList.map(item => {
      if (item.word === wordKey) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    this.setData({ wordList: updatedList });
  },
  // 切换掌握状态
  toggleMastered(e) {
    const wordKey = e.currentTarget.dataset.word;
    let storedList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    const updatedList = this.data.wordList.map(item => {
      if (item.word === wordKey) {
        item.mastered = !item.mastered;
      }
      return item;
    });
    // 同步更新 storage 中的数据
    storedList = storedList.map(item => {
      if (item.word === wordKey) {
        item.mastered = !item.mastered;
      }
      return item;
    });
    wx.setStorageSync(app.globalData.STORAGE_KEY, storedList);
    this.setData({ wordList: updatedList });
  }
});
