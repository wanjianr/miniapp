const app = getApp();

Page({
  data: {
    mode: 'word', // "word", "sentence", "both"
    showTranslation: false,
    reviewList: [],
    currentIndex: 0,
    currentWord: null
  },
  onLoad() {
    this.loadReviewList();
  },
  loadReviewList() {
    const app = getApp();
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];    
    const now = Date.now();
    // 过滤条件：下次复习时间到期且未掌握
    let reviewList = wordList.filter(item => {
      return (!item.mastered) && (item.nextReview <= now);
    });
    this.setData({ reviewList }, () => {
      this.showWord(0);
    });
  },
  showWord(index) {
    if (this.data.reviewList.length === 0) {
      this.setData({ currentWord: null });
      return;
    }
    if (index < 0) index = 0;
    if (index >= this.data.reviewList.length) index = this.data.reviewList.length - 1;
    this.setData({
      currentIndex: index,
      currentWord: this.data.reviewList[index]
    });
  },
  nextWord() {
    let newIndex = this.data.currentIndex + 1;
    if (newIndex >= this.data.reviewList.length) newIndex = 0;
    this.showWord(newIndex);
  },
  prevWord() {
    let newIndex = this.data.currentIndex - 1;
    if (newIndex < 0) newIndex = this.data.reviewList.length - 1;
    this.showWord(newIndex);
  },
  markMastered() {
    let word = this.data.currentWord;
    if (!word) return;
    // 更新全局数据：设置 mastered 为 true
    word.mastered = true;
    // 获取所有数据，更新对应单词
    const app = getApp();
    let wordList = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    
    for (let i = 0; i < wordList.length; i++) {
      if (wordList[i].word === word.word) { // 简单匹配，可扩展为ID匹配
        wordList[i] = word;
        break;
      }
    }
    wx.setStorageSync(app.globalData.STORAGE_KEY, wordList);
    wx.showToast({
      title: '标记已掌握',
      icon: 'success'
    });
    // 从复习列表中移除此单词并刷新显示
    let reviewList = this.data.reviewList;
    reviewList.splice(this.data.currentIndex, 1);
    this.setData({ reviewList }, () => {
      this.showWord(this.data.currentIndex);
    });
  },
  onModeChange(e) {
    this.setData({
      mode: e.detail.value
    });
  },
  onToggleTranslation(e) {
    this.setData({
      showTranslation: e.detail.value
    });
  }
});
