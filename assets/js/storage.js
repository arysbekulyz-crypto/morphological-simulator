(function () {
  var KEY = 'morphologyTrainerThreeLevels.v1';
  var topicOrder = window.MorphologyData.topicOrder;
  var levels = window.MorphologyData.levels;

  function blankState() {
    var completed = {};
    Object.keys(levels).forEach(function (levelId) {
      completed[levelId] = {};
      topicOrder.forEach(function (topicId) { completed[levelId][topicId] = []; });
    });
    return { selectedLevel: null, completed: completed };
  }

  function load() {
    var base = blankState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var parsed = JSON.parse(raw);
      if (parsed.selectedLevel && levels[parsed.selectedLevel]) base.selectedLevel = parsed.selectedLevel;
      Object.keys(levels).forEach(function (levelId) {
        topicOrder.forEach(function (topicId) {
          var values = parsed.completed && parsed.completed[levelId] && parsed.completed[levelId][topicId];
          if (Array.isArray(values)) base.completed[levelId][topicId] = values.filter(function (id) { return typeof id === 'string'; });
        });
      });
      return base;
    } catch (error) {
      return base;
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) { /* private mode may block storage */ }
  }

  function selectLevel(levelId) {
    var state = load();
    if (levels[levelId]) {
      state.selectedLevel = levelId;
      save(state);
    }
  }

  function getSelectedLevel() { return load().selectedLevel; }

  function completedIds(levelId, topicId) {
    var state = load();
    return state.completed[levelId] && state.completed[levelId][topicId] ? state.completed[levelId][topicId].slice() : [];
  }

  function markCompleted(levelId, topicId, exerciseId) {
    var state = load();
    var list = state.completed[levelId][topicId];
    var changed = list.indexOf(exerciseId) === -1;
    if (changed) {
      list.push(exerciseId);
      save(state);
    }
    return changed;
  }

  function resetLevel(levelId) {
    var state = load();
    if (!state.completed[levelId]) return;
    topicOrder.forEach(function (topicId) { state.completed[levelId][topicId] = []; });
    save(state);
  }

  window.MorphologyStorage = {
    load: load,
    selectLevel: selectLevel,
    getSelectedLevel: getSelectedLevel,
    completedIds: completedIds,
    markCompleted: markCompleted,
    resetLevel: resetLevel
  };
})();
