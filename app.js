App({
    onLaunch() {
      const words = wx.getStorageSync('words');
      if (words) {
        this.globalData.words = words;
      }
    },
    globalData: {
      words: []
    }
  });