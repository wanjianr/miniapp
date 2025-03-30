const app = getApp();

Page({
  data: {
    mode: "word",            // 学习模式：word, sentence, both
    showTranslation: false,  // 是否显示中文
    reviewList: [],          // 当天需要复习的单词列表
    currentWord: null,        // 当前展示的单词
    buttonOrder: ['not-mastered', 'mastered', 'proficient'] // 初始按钮顺序
  },

  onLoad() {
    this.loadReviewList();
  },

  // 模式切换
  onModeChange(e) {
    this.setData({
      mode: e.detail.value
    });
  },

  // 切换中文显示开关
  onToggleTranslation(e) {
    this.setData({
      showTranslation: e.detail.value
    });
  },

  // 加载复习列表：挑选出 nextReview 已到且未掌握的单词
  loadReviewList() {
    let allWords = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    const now = Date.now();
    let reviewList = allWords.filter(item => !item.mastered && (item.nextReview <= now));
    // 按字母顺序排序（可根据需求调整排序规则）
    reviewList.sort((a, b) => a.word.localeCompare(b.word));
    this.setData({
      reviewList: reviewList,
      currentWord: reviewList.length > 0 ? reviewList[0] : null
    });
  },

  // 处理复习按钮点击事件
  handleReview(e) {
    const isMastered = e.currentTarget.dataset.mastered === "true";
    const isProficient = e.currentTarget.dataset.mastered === "proficient";

    let currentWord = this.data.currentWord;
    const now = Date.now();
    const reviewIntervals = app.globalData.reviewIntervals;
    
    if (isMastered) {
      // 如果当前复习步数未达到最后阶段，则推进到下一个复习间隔；否则标记为已掌握
      if (currentWord.intervalIndex < reviewIntervals.length - 1) {
        currentWord.intervalIndex += 1;
        currentWord.nextReview = now + reviewIntervals[currentWord.intervalIndex];
      } else {
        currentWord.mastered = true;
      }
    } else {
        if (isProficient) {
            currentWord.mastered = true;   
        } else {
            // 点击“不认识”时，重置复习计划，安排立即复习
            currentWord.intervalIndex = 0;
            currentWord.nextReview = now + reviewIntervals[0];
        }

    }
    
    // 更新全局存储中该单词的信息
    let allWords = wx.getStorageSync(app.globalData.STORAGE_KEY) || [];
    for (let i = 0; i < allWords.length; i++) {
      if (allWords[i].word === currentWord.word) {
        allWords[i] = currentWord;
        break;
      }
    }
    wx.setStorageSync(app.globalData.STORAGE_KEY, allWords);
    
    // 重新加载复习列表
    this.loadReviewList();
    
    // 根据用户操作选择下一个单词展示
    if (!isMastered) {
      // “不认识”操作：随机从复习列表中挑选一个单词展示
      let list = this.data.reviewList;
      if (list.length > 0) {
        let randomIndex = Math.floor(Math.random() * list.length);
        this.setData({ currentWord: list[randomIndex] });
      } else {
        this.setData({ currentWord: null });
      }
    } else {
      // “掌握”操作：采用顺序方式，若还有复习单词，则展示第一个
      if (this.data.reviewList.length > 0) {
        this.setData({ currentWord: this.data.reviewList[0] });
      } else {
        this.setData({ currentWord: null });
      }
    }
  },

  reorderButtons(e) {
    // 反转按钮顺序
    let newOrder = [...this.data.buttonOrder].reverse();
    this.setData({
        buttonOrder: newOrder
      });
  }
});
