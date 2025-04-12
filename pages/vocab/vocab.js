const app = getApp();

Page({
  data: {
    wordList: [],
    unmasteredCount: 0 // 未掌握单词数量
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
    // 计算未掌握单词数量
    const unmasteredCount = wordList.filter(item => !item.mastered).length;
    this.setData({ wordList, unmasteredCount });;
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
    // 格式化 nextReview
    const formattedWordList = updatedList.map(item => ({
        ...item,
        formattedNextReview: this.formatDateTime(item.nextReview)
      }));
    this.setData({ wordList: formattedWordList });
  },

  // 格式化时间戳
  formatDateTime(timestamp) {
    if (!timestamp || isNaN(timestamp)) {
      return '无效时间';
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
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
