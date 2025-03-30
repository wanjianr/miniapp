const app = getApp();

Page({
  data: {
    wordList: []
  },
  onLoad() {
    this.loadWordList();
  },
  // 每次页面展示时刷新数据
  onShow() {
    this.loadWordList();
  },
  loadWordList() {
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    // 按字母顺序排序
    wordList.sort((a, b) => a.word.localeCompare(b.word));
    // 初始化 expanded 字段
    wordList = wordList.map(item => ({
      ...item,
      expanded: item.expanded || false
    }));
    this.setData({ wordList });
  },
  // 展开/收起详情
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
    let updatedList = this.data.wordList.map(item => {
      if (item.word === wordKey) {
        item.mastered = !item.mastered;
      }
      return item;
    });
    // 更新 storage
    wx.setStorageSync(app.globalData.STORAGE_KEY, updatedList);
    // 刷新页面数据
    this.loadWordList();
  }
});
