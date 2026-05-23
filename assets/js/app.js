(function () {
  var data = window.MorphologyData;
  var storage = window.MorphologyStorage;
  var progress = window.MorphologyProgress;
  var exercises = window.MorphologyExercises;
  var app = document.getElementById('app');
  var esc = exercises.escape;

  function routeParts() {
    var raw = window.location.hash.replace(/^#\/?/, '');
    return raw ? raw.split('/').filter(Boolean) : [];
  }
  function validLevel(levelId) { return levelId && data.levels[levelId]; }
  function levelOrSelected(levelId) {
    return validLevel(levelId) ? levelId : (validLevel(storage.getSelectedLevel()) ? storage.getSelectedLevel() : null);
  }
  function setTheme(levelId) {
    if (validLevel(levelId)) document.body.dataset.level = levelId;
    else document.body.removeAttribute('data-level');
  }
  function header(levelId) {
    var selected = levelOrSelected(levelId);
    return '<header class="app-header"><div class="container header-inner">' +
      '<a class="brand" href="#/" aria-label="На стартовую страницу"><span class="brand-mark">М</span><span class="brand-text">Морфология<small>интерактивный тренажёр</small></span></a>' +
      '<nav class="header-actions" aria-label="Основная навигация">' +
        (selected ? '<span class="level-pill">' + esc(data.levels[selected].name) + '</span>' +
          '<a class="nav-link" href="#/level/' + selected + '">Темы</a>' +
          '<a class="nav-link" href="#/progress/' + selected + '">Прогресс</a>' : '') +
        '<a class="nav-link" href="#/about">О ресурсе</a>' +
        (selected ? '<a class="btn btn-secondary" href="#/">Сменить уровень</a>' : '') +
      '</nav></div></header>';
  }
  function footer() {
    return '<footer class="site-footer"><div class="container">© 2026 · Учебный цифровой ресурс по морфологии</div></footer>';
  }
  function progressBar(stats) {
    return '<div class="mini-progress"><div class="progress-label"><span>Выполнено</span><span>' + stats.completed + ' / ' + stats.total + ' · ' + stats.percent + '%</span></div>' +
      '<div class="progress-track" aria-label="Прогресс ' + stats.percent + ' процентов"><div class="progress-fill" style="--percentage:' + stats.percent + '%"></div></div></div>';
  }
  function renderLanding() {
    setTheme(null);
    var selected = levelOrSelected(null);
    app.innerHTML = '<div class="screen">' + header(null) +
      '<section class="landing-hero"><div class="container hero-layout">' +
        '<div class="hero-copy"><div class="eyebrow">Русский язык · части речи</div>' +
          '<h1>' + esc(data.meta.title) + '</h1>' +
          '<p class="lead">Выбери уровень и изучай русский язык с помощью понятных схем, примеров и интерактивных заданий.</p>' +
          '<div class="hero-actions"><button class="btn btn-primary" type="button" id="choose-level-button">Выбрать уровень</button>' +
          (selected ? '<a class="btn btn-secondary" href="#/level/' + selected + '">Продолжить: ' + esc(data.levels[selected].name) + '</a>' : '') + '</div></div>' +
        '<div class="hero-visual"><img src="assets/images/illustrations/hero-books.svg" alt="Книги и визуальные карточки частей речи"><span class="float-label first">Инфографика</span><span class="float-label second">36 заданий</span></div>' +
      '</div></section>' +
      '<section class="level-selection" id="levels"><div class="container"><div class="section-head"><div><h2>Выбери свой уровень</h2><p>Материал усложняется от узнавания к самостоятельному анализу.</p></div></div>' +
        '<div class="level-grid">' + Object.keys(data.levels).map(function (levelId) {
          var level = data.levels[levelId];
          return '<article class="level-card ' + levelId + '"><span class="level-icon" aria-hidden="true">' + level.icon + '</span>' +
            '<h3>' + esc(level.name) + '</h3><div class="level-grade">' + esc(level.grade) + '</div><p>' + esc(level.description) + '</p>' +
            '<a class="btn btn-primary" href="#/level/' + levelId + '">' + esc(level.button) + '</a></article>';
        }).join('') + '</div></div></section>' +
      '<section class="section steps-section"><div class="container"><div class="section-head"><div><h2>Как работает тренажёр</h2></div></div><div class="steps-grid">' +
        [['Выбери уровень', 'Начни с подходящей сложности.'], ['Изучи инфографику', 'Схема помогает увидеть правило.'], ['Выполни задания', 'Проверь, как ты применяешь знания.'], ['Следи за прогрессом', 'Результаты сохраняются на устройстве.']].map(function (step, index) {
          return '<article class="step-card"><div class="step-num">' + (index + 1) + '</div><h3>' + step[0] + '</h3><p>' + step[1] + '</p></article>';
        }).join('') + '</div></div></section>' +
      '<section class="section"><div class="container"><div class="project-note"><p>Ресурс разработан в рамках дипломного проекта «' + esc(data.meta.project) + '».</p></div></div></section>' + footer() + '</div>';
    document.getElementById('choose-level-button').addEventListener('click', function () {
      document.getElementById('levels').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  function renderLevel(levelId) {
    if (!validLevel(levelId)) { renderLanding(); return; }
    storage.selectLevel(levelId);
    setTheme(levelId);
    var level = data.levels[levelId];
    var stats = progress.levelStats(levelId);
    app.innerHTML = '<div class="screen">' + header(levelId) +
      '<section class="level-hero"><div class="container level-hero-layout"><div>' +
        '<div class="eyebrow">Уровень обучения</div><h1>' + level.icon + ' ' + esc(level.name) + '</h1>' +
        '<p>' + esc(level.purpose) + '</p>' +
        (levelId === 'beginner' ? '<div class="mascot-note"><img src="assets/images/illustrations/owl.svg" alt="Совёнок Знайка"><span><strong>Знайка:</strong> изучи подсказку и получай звёзды за задания!</span></div>' : '') + '</div>' +
        '<div class="overall-chip" style="--percentage:' + stats.percent + '%"><div><span>' + stats.percent + '%</span><small>общий прогресс</small></div></div></div></section>' +
      '<section class="section"><div class="container"><div class="section-head"><div><h2>Выбери тему</h2><p>В каждой теме есть инфографика и три задания.</p></div><a class="btn btn-soft" href="#/progress/' + levelId + '">Открыть прогресс</a></div>' +
        '<div class="topic-grid">' + data.topicOrder.map(function (topicId) {
          var topic = level.topics[topicId];
          var topicStats = stats.topics[topicId];
          return '<article class="topic-card"><div class="topic-icon" aria-hidden="true">' + topic.icon + '</div><h3>' + esc(topic.title) + '</h3>' +
            '<p>' + esc(topic.focus) + '. ' + esc(topic.intro) + '</p>' + progressBar(topicStats) +
            '<a class="btn btn-primary" href="#/topic/' + levelId + '/' + topicId + '">Открыть тему</a></article>';
        }).join('') + '</div></div></section>' + footer() + '</div>';
  }
  function visualMarkup(visual) {
    if (!visual) return '';
    var html = '';
    if (visual.type === 'groups') {
      html = '<div class="visual-groups">' + visual.groups.map(function (group) {
        return '<div class="visual-group"><h3>' + esc(group.title) + '</h3><div class="visual-items">' + group.items.map(function (item) {
          return '<div class="visual-item"><span aria-hidden="true">' + item[0] + '</span><span>' + esc(item[1]) + '</span></div>';
        }).join('') + '</div></div>';
      }).join('') + '</div>';
    } else if (visual.type === 'pairs') {
      html = '<div class="visual-pairs">' + visual.pairs.map(function (pair) {
        return '<div class="visual-pair"><span class="pair-icon" aria-hidden="true">' + pair[0] + '</span><span>' + esc(pair[1]) + '</span></div>';
      }).join('') + '</div>';
    } else if (visual.type === 'flow') {
      html = '<div class="visual-flow">' + visual.nodes.map(function (node, index) {
        return '<div class="flow-node">' + esc(node) + '</div>' + (index < visual.nodes.length - 1 ? '<div class="flow-arrow" aria-hidden="true">→</div>' : '');
      }).join('') + '</div>';
    } else if (visual.type === 'table') {
      html = '<div class="visual-table" style="--cols:' + visual.headers.length + '"><div class="visual-row">' + visual.headers.map(function (header) { return '<div>' + esc(header) + '</div>'; }).join('') + '</div>' +
        visual.rows.map(function (row) { return '<div class="visual-row">' + row.map(function (cell) { return '<div>' + esc(cell) + '</div>'; }).join('') + '</div>'; }).join('') + '</div>';
    } else if (visual.type === 'steps') {
      html = '<div class="visual-steps">' + visual.steps.map(function (step) { return '<div class="visual-step">' + esc(step) + '</div>'; }).join('') + '</div>';
    } else if (visual.type === 'timeline') {
      html = '<div class="timeline">' + visual.points.map(function (point) { return '<div class="time-point"><strong>' + esc(point[0]) + '</strong><div>' + esc(point[1]) + '</div><small>' + esc(point[2]) + '</small></div>'; }).join('') + '</div>';
    }
    if (visual.extra) html += '<div style="margin-top:16px">' + visualMarkup(visual.extra) + '</div>';
    return html;
  }
  function renderTopic(levelId, topicId) {
    if (!validLevel(levelId) || !data.levels[levelId].topics[topicId]) { renderLanding(); return; }
    storage.selectLevel(levelId);
    setTheme(levelId);
    var level = data.levels[levelId];
    var topic = level.topics[topicId];
    var stats = progress.topicStats(levelId, topicId);
    var completed = storage.completedIds(levelId, topicId);
    var infographicLabel = levelId === 'expert' ? 'Инфографика-алгоритм' : 'Инфографика-подсказка';
    app.innerHTML = '<div class="screen">' + header(levelId) + '<div class="container topic-page">' +
      '<nav class="breadcrumb" aria-label="Путь страницы"><a href="#/level/' + levelId + '">← Темы</a><span>›</span><span>' + esc(level.name) + '</span><span>›</span><span>' + esc(topic.title) + '</span></nav>' +
      '<div class="topic-heading"><div><div class="eyebrow">' + esc(topic.focus) + '</div><h1>' + topic.icon + ' ' + esc(topic.title) + '</h1><p>' + esc(topic.intro) + '</p></div><div class="topic-progress" id="topic-progress">' + progressBar(stats) + '</div></div>' +
      '<section class="learning-layout" aria-label="Объяснение и инфографика"><article class="panel"><h2>Разберём правило</h2>' +
        '<div class="problem"><strong>Проблемный вопрос</strong>' + esc(topic.problem) + '</div>' +
        '<p class="definition">' + esc(topic.definition) + '</p><h3>Примеры</h3><ul class="example-list">' + topic.examples.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul></article>' +
        '<article class="panel info-panel"><div class="panel-title"><span aria-hidden="true">▦</span><h2>' + infographicLabel + '</h2></div>' + visualMarkup(topic.visual) +
          (topic.legacyAsset ? '<details class="legacy-details"><summary>Открыть дополнительную схему из первой версии</summary><img src="' + esc(topic.legacyAsset) + '" alt="Дополнительная схема по теме ' + esc(topic.title) + '" loading="lazy"></details>' : '') +
        '</article></section>' +
      '<section class="panel" aria-label="Практические задания"><div class="practice-head"><div><h2>Практика</h2><p class="muted">Выполни все три задания, чтобы завершить тему.</p></div></div><div class="exercise-grid" id="exercise-grid">' + exercises.render(topic.exercises, completed) + '</div></section>' +
      '<section class="reflection"><h3>' + (levelId === 'beginner' ? 'Подсказка Знайки' : 'Короткая рефлексия') + '</h3><p>' + esc(topic.reflection) + '</p></section>' +
      '</div>' + footer() + '</div>';
    exercises.bind(document.getElementById('exercise-grid'), levelId, topicId, function () {
      var updated = progress.topicStats(levelId, topicId);
      document.getElementById('topic-progress').innerHTML = progressBar(updated);
    });
  }
  function starScore(percent) {
    var filled = Math.round(percent / 20);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }
  function renderProgress(levelId) {
    levelId = levelOrSelected(levelId);
    if (!levelId) { renderLanding(); return; }
    storage.selectLevel(levelId);
    setTheme(levelId);
    var level = data.levels[levelId];
    var stats = progress.levelStats(levelId);
    app.innerHTML = '<div class="screen">' + header(levelId) + '<section class="progress-page"><div class="container">' +
      '<div class="breadcrumb"><a href="#/level/' + levelId + '">← Вернуться к темам</a></div>' +
      '<div class="progress-summary"><article class="summary-card"><div class="eyebrow">' + esc(level.name) + '</div><h1>Мой прогресс</h1><p class="muted">Здесь сохраняются задания, выполненные на этом устройстве.</p></article>' +
      '<article class="summary-card"><div class="summary-value">' + stats.percent + '%</div><p>' + stats.completed + ' из ' + stats.total + ' заданий выполнено · завершено тем: ' + stats.finishedTopics + ' из 4</p>' +
      (levelId === 'beginner' ? '<div class="stars" aria-label="Звёзды прогресса">' + starScore(stats.percent) + '</div>' : progressBar({completed:stats.completed,total:stats.total,percent:stats.percent})) + '</article></div>' +
      '<div class="progress-list">' + data.topicOrder.map(function (topicId) {
        var topic = level.topics[topicId];
        var topicStats = stats.topics[topicId];
        return '<article class="progress-topic"><div><h3>' + topic.icon + ' ' + esc(topic.title) + '</h3><p>' + (topicStats.finished ? 'Тема завершена' : 'Продолжи выполнение заданий') + '</p></div>' +
          '<strong>' + topicStats.percent + '%</strong>' + progressBar(topicStats) + '<a class="btn btn-soft" href="#/topic/' + levelId + '/' + topicId + '">Открыть</a></article>';
      }).join('') + '</div><div class="reset-row"><button class="btn btn-danger" id="reset-progress" type="button">Сбросить прогресс</button></div></div></section>' + footer() + '</div>';
    document.getElementById('reset-progress').addEventListener('click', function () {
      if (window.confirm('Сбросить весь прогресс уровня «' + level.name + '»? Это действие нельзя отменить.')) {
        storage.resetLevel(levelId);
        renderProgress(levelId);
      }
    });
  }
  function renderAbout() {
    var selected = levelOrSelected(null);
    setTheme(selected);
    app.innerHTML = '<div class="screen">' + header(selected) + '<section class="about-page"><div class="container"><article class="about-card">' +
      '<div class="eyebrow">О ресурсе</div><h1>' + esc(data.meta.title) + '</h1>' +
      '<p>Тренажёр разработан как практический цифровой ресурс для дипломного проекта «' + esc(data.meta.project) + '».</p>' +
      '<p>Инфографика здесь используется не только как иллюстрация, но и как инструмент понимания, применения правила и языкового анализа.</p>' +
      '<div class="about-grid"><article><h3>Начинающий</h3><p>Узнаёт и различает части речи.</p></article><article><h3>Исследователь</h3><p>Понимает правило и применяет его.</p></article><article><h3>Эксперт</h3><p>Анализирует текст и объясняет решение.</p></article></div>' +
      '<div style="margin-top:25px"><a class="btn btn-primary" href="#/">Выбрать уровень</a></div></article></div></section>' + footer() + '</div>';
  }
  function render() {
    var parts = routeParts();
    if (!parts.length) return renderLanding();
    if (parts[0] === 'level') return renderLevel(parts[1]);
    if (parts[0] === 'topic') return renderTopic(parts[1], parts[2]);
    if (parts[0] === 'progress') return renderProgress(parts[1]);
    if (parts[0] === 'about') return renderAbout();
    renderLanding();
  }
  window.addEventListener('hashchange', render);
  render();
})();
