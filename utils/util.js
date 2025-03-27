function calculateNextReviewDate(lastReviewed, reviewStage) {
    const intervals = [1, 3, 7, 14, 30]; // 艾宾浩斯复习间隔（天）
    const interval = intervals[reviewStage] || 30;
    const nextReviewDate = new Date(lastReviewed);
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    return nextReviewDate.toISOString().split('T')[0];
  }
  
  function updateReviewStatus(word) {
    const today = new Date().toISOString().split('T')[0];
    word.last_reviewed = today;
    word.review_stage = word.review_stage ? word.review_stage + 1 : 1;
    word.next_review = calculateNextReviewDate(today, word.review_stage);
    word.review_count = word.review_count ? word.review_count + 1 : 1;
    return word;
  }
  
  module.exports = {
    updateReviewStatus
  };