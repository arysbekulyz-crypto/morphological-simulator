(function () {
  var data = window.MorphologyData;
  var storage = window.MorphologyStorage;

  function topicStats(levelId, topicId) {
    var total = data.levels[levelId].topics[topicId].exercises.length;
    var completed = storage.completedIds(levelId, topicId).filter(function (id) {
      return data.levels[levelId].topics[topicId].exercises.some(function (task) { return task.id === id; });
    }).length;
    var percent = total ? Math.round(completed / total * 100) : 0;
    return { completed: completed, total: total, percent: percent, finished: completed === total };
  }

  function levelStats(levelId) {
    var complete = 0;
    var total = 0;
    var topics = {};
    data.topicOrder.forEach(function (topicId) {
      topics[topicId] = topicStats(levelId, topicId);
      complete += topics[topicId].completed;
      total += topics[topicId].total;
    });
    return {
      topics: topics,
      completed: complete,
      total: total,
      percent: total ? Math.round(complete / total * 100) : 0,
      finishedTopics: data.topicOrder.filter(function (topicId) { return topics[topicId].finished; }).length
    };
  }

  window.MorphologyProgress = { topicStats: topicStats, levelStats: levelStats };
})();
