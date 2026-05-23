(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char];
    });
  }
  function normalize(value) {
    return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[.,!?;:«»"'()—–-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function buttonRow(exercise) {
    return '<div class="exercise-actions">' +
      '<button class="btn btn-primary" type="button" data-action="check" aria-label="Проверить ответ">Проверить</button>' +
      '<button class="btn btn-secondary" type="button" data-action="retry" aria-label="Попробовать снова">Попробовать снова</button>' +
      (exercise.hint ? '<button class="btn btn-soft" type="button" data-action="hint" aria-label="Показать подсказку">Подсказка</button>' : '') +
      '</div>' +
      (exercise.hint ? '<div class="hint">' + escapeHtml(exercise.hint) + '</div>' : '') +
      '<div class="feedback" role="status"></div>';
  }
  function optionsHtml(exercise, inputType) {
    return exercise.options.map(function (option, index) {
      return '<label class="option"><input type="' + inputType + '" name="' + escapeHtml(exercise.id) + '" value="' + escapeHtml(option) + '"><span>' + escapeHtml(option) + '</span></label>';
    }).join('');
  }
  function renderBody(exercise) {
    if (exercise.type === 'single') return optionsHtml(exercise, 'radio');
    if (exercise.type === 'multi') return optionsHtml(exercise, 'checkbox');
    if (exercise.type === 'sort' || exercise.type === 'match') {
      var options = exercise.groups || exercise.options;
      return exercise.items.map(function (item) {
        return '<div class="' + (exercise.type === 'sort' ? 'sort-row' : 'match-row') + '">' +
          '<label>' + escapeHtml(item.label) + '</label>' +
          '<select class="select-field" data-correct="' + escapeHtml(item.answer) + '" aria-label="Выберите ответ для ' + escapeHtml(item.label) + '">' +
            '<option value="">Выберите…</option>' + options.map(function (value) { return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>'; }).join('') +
          '</select></div>';
      }).join('');
    }
    if (exercise.type === 'select') {
      return exercise.lines.map(function (line) {
        return '<div class="cloze-line"><span>' + escapeHtml(line.before) + '</span>' +
          '<select class="select-field" data-correct="' + escapeHtml(line.answer) + '" aria-label="Выберите пропущенную форму">' +
          '<option value="">…</option>' + line.options.map(function (value) { return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>'; }).join('') +
          '</select><span>' + escapeHtml(line.after) + '</span></div>';
      }).join('');
    }
    if (exercise.type === 'keyword') {
      return '<label class="sr-only" for="answer-' + escapeHtml(exercise.id) + '">Введите объяснение</label>' +
        '<textarea id="answer-' + escapeHtml(exercise.id) + '" class="textarea-field" placeholder="Напишите краткое объяснение…"></textarea>';
    }
    return '';
  }
  function render(exercises, completedIds) {
    return exercises.map(function (exercise, index) {
      var completed = completedIds.indexOf(exercise.id) !== -1;
      return '<article class="exercise-card' + (completed ? ' completed' : '') + '" data-exercise-id="' + escapeHtml(exercise.id) + '" data-type="' + escapeHtml(exercise.type) + '">' +
        '<div class="exercise-number">Задание ' + (index + 1) + '</div>' +
        '<h3>' + escapeHtml(exercise.title) + '</h3>' +
        '<p class="instruction">' + escapeHtml(exercise.instruction) + '</p>' +
        '<div class="exercise-body">' + renderBody(exercise) + '</div>' +
        buttonRow(exercise) + '</article>';
    }).join('');
  }
  function valuesFrom(card, selector) {
    return Array.prototype.slice.call(card.querySelectorAll(selector));
  }
  function validate(card, exercise) {
    if (exercise.type === 'single') {
      var selected = card.querySelector('input:checked');
      return selected && normalize(selected.value) === normalize(exercise.answer);
    }
    if (exercise.type === 'multi') {
      var actual = valuesFrom(card, 'input:checked').map(function (field) { return normalize(field.value); }).sort();
      var expected = exercise.answers.map(normalize).sort();
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    if (exercise.type === 'sort' || exercise.type === 'match' || exercise.type === 'select') {
      return valuesFrom(card, 'select').every(function (field) {
        return normalize(field.value) && normalize(field.value) === normalize(field.dataset.correct);
      });
    }
    if (exercise.type === 'keyword') {
      var answer = normalize(card.querySelector('textarea').value);
      return exercise.keywords.every(function (group) {
        return group.some(function (keyword) { return answer.indexOf(normalize(keyword)) !== -1; });
      });
    }
    return false;
  }
  function clearInputs(card) {
    valuesFrom(card, 'input').forEach(function (input) { input.checked = false; });
    valuesFrom(card, 'select').forEach(function (select) { select.selectedIndex = 0; });
    valuesFrom(card, 'textarea').forEach(function (area) { area.value = ''; });
    var feedback = card.querySelector('.feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
    var hint = card.querySelector('.hint');
    if (hint) hint.classList.remove('visible');
  }
  function response(level, ok, id) {
    var responses = ok ? level.feedback.correct : level.feedback.wrong;
    return responses[id.length % responses.length];
  }
  function bind(container, levelId, topicId, onSolved) {
    var level = window.MorphologyData.levels[levelId];
    var topic = level.topics[topicId];
    container.addEventListener('click', function (event) {
      var actionButton = event.target.closest('[data-action]');
      if (!actionButton || !container.contains(actionButton)) return;
      var card = actionButton.closest('.exercise-card');
      var exercise = topic.exercises.find(function (item) { return item.id === card.dataset.exerciseId; });
      if (!exercise) return;
      if (actionButton.dataset.action === 'hint') {
        var hint = card.querySelector('.hint');
        if (hint) hint.classList.toggle('visible');
        return;
      }
      if (actionButton.dataset.action === 'retry') {
        clearInputs(card);
        return;
      }
      var ok = validate(card, exercise);
      var feedback = card.querySelector('.feedback');
      feedback.textContent = response(level, ok, exercise.id);
      feedback.className = 'feedback ' + (ok ? 'success' : 'error');
      if (ok) {
        var changed = window.MorphologyStorage.markCompleted(levelId, topicId, exercise.id);
        card.classList.add('completed');
        if (changed && typeof onSolved === 'function') onSolved();
      }
    });
  }
  window.MorphologyExercises = { render: render, bind: bind, escape: escapeHtml };
})();
