const { updateReviewStatus } = require('../../utils/util.js');

Page({
  data: {
    learningMode: 'word',
    words: [],
    currentWord: {},
    currentIndex: 0, // 当前单词索引
    showTranslation: true, // 是否展示翻译
    masteredWordsCount: 0, // 已掌握单词数量
  },

  onLoad() {
    const app = getApp();
    const words = app.globalData.words;
    if (words && words.length > 0) {
      this.setData({
        words: words,
        currentWord: this.getNextWord(words),
        masteredWordsCount: words.filter(word => word.is_mastered).length
      });
    } else {
      this.setData({
        currentWord: {
          word: 'example',
          part_of_speech: 'n.',
          phonetic: '/ɪɡˈzæmpəl/',
          translation: '例子；范例',
          example_sentence: 'This is a typical example of his work.',
          example_translation: '这是他作品的典型例子。',
        }
      });
    }
  },

  onOptionChange(e) {
    this.setData({
      learningMode: e.detail.value
    });
  },

  onUploadTap() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'utf-8',
          success: (res) => {
            try {
              const words = JSON.parse(res.data).map(word => ({
                ...word,
                last_reviewed: "",
                next_review: "",
                review_interval: null,
                review_stage: null,
                review_count: 0,
                is_mastered: false
              }));
              this.setData({
                words: words,
                currentWord: this.getNextWord(words),
                currentIndex: 0,
                masteredWordsCount: 0
              });
              wx.setStorageSync('words', words); // 存储词库数据到本地存储
              const app = getApp();
              app.globalData.words = words; // 更新全局数据
            } catch (err) {
              console.error('Failed to parse JSON file:', err);
            }
          },
          fail: (err) => {
            console.error('Failed to read file:', err);
          }
        });
      },
      fail: (err) => {
        console.error('Failed to choose file:', err);
      }
    });
  },

  onNextWord() {
    const { words, currentIndex } = this.data;
    words[currentIndex] = updateReviewStatus(words[currentIndex]);
    const newIndex = (currentIndex + 1) % words.length;
    this.setData({
      currentIndex: newIndex,
      currentWord: words[newIndex]
    });
    wx.setStorageSync('words', words); // 更新本地存储
    const app = getApp();
    app.globalData.words = words; // 更新全局数据
  },

  onMarkAsMastered() {
    const { words, currentIndex } = this.data;
    words[currentIndex].is_mastered = true;
    this.setData({
      words: words,
      masteredWordsCount: words.filter(word => word.is_mastered).length
    });
    wx.setStorageSync('words', words); // 更新本地存储
    const app = getApp();
    app.globalData.words = words; // 更新全局数据
  },

  getNextWord(words) {
    return words[Math.floor(Math.random() * words.length)];
  }
});