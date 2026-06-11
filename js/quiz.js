(function () {
  const config = window.TORTODOM_CONFIG;
  const data = window.TORTODOM_DATA;
  const { fillings, questions, rankMeta, backupReasons } = data;

  let currentQuestion = 0;
  let scores = {};
  let userTags = [];
  let isStarted = false;

  const quizSection = document.getElementById("quiz");
  const quizIntro = document.getElementById("quizIntro");
  const quizActive = document.getElementById("quizActive");
  const questionsContainer = document.getElementById("questions");
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  const resultBlock = document.getElementById("result");
  const resultList = document.getElementById("resultList");
  const telegramBtn = document.getElementById("telegramBtn");

  function resetScores() {
    scores = {};
    fillings.forEach((filling) => {
      scores[filling.name] = 0;
    });
  }

  function renderQuestion() {
    const question = questions[currentQuestion];

    questionsContainer.innerHTML = `
      <div class="question active">
        <h2>${question.title}</h2>
        <div class="options">
          ${question.answers
            .map(
              (answer, index) => `
            <button type="button" class="option" data-answer-index="${index}">
              ${answer.text}
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    questionsContainer.querySelectorAll(".option").forEach((button) => {
      button.addEventListener("click", () => {
        chooseAnswer(Number(button.dataset.answerIndex));
      });
    });

    const progress = Math.round((currentQuestion / questions.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressLabel.textContent = `Вопрос ${currentQuestion + 1} из ${questions.length}`;
  }

  function chooseAnswer(answerIndex) {
    const answer = questions[currentQuestion].answers[answerIndex];

    if (answer.tags) {
      userTags.push(...answer.tags);
    }

    fillings.forEach((filling) => {
      if (answer.tags) {
        answer.tags.forEach((tag) => {
          if (filling.tags.includes(tag)) {
            scores[filling.name] += 2;
          }
        });
      }

      if (answer.minusTags) {
        answer.minusTags.forEach((tag) => {
          if (filling.tags.includes(tag)) {
            scores[filling.name] -= 4;
          }
        });
      }
    });

    currentQuestion += 1;

    if (currentQuestion < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  function getMatchPercent(filling, rank, topScore) {
    const uniqueUserTags = [...new Set(userTags)];
    const matchedTags = filling.tags.filter((tag) => uniqueUserTags.includes(tag)).length;
    const tagRatio = uniqueUserTags.length ? matchedTags / uniqueUserTags.length : 0.5;
    const scoreRatio = topScore > 0 ? Math.max(0, scores[filling.name]) / topScore : 0;

    const raw = tagRatio * 55 + scoreRatio * 40 + (rank === 0 ? 5 : rank === 1 ? 2 : 0);
    const floors = [92, 84, 76];
    const caps = [98, 91, 86];

    return Math.min(caps[rank], Math.max(floors[rank], Math.round(raw)));
  }

  function getBackupReason(filling) {
    const uniqueUserTags = [...new Set(userTags)];
    const matched = filling.tags.filter((tag) => uniqueUserTags.includes(tag));

    if (matched.length === 0) {
      return "Запасной вариант на случай, если захотите чуть другой настрой праздника.";
    }

    const topTag = matched[0];
    return backupReasons[topTag] || "Хорошая альтернатива, если перед заказом захочется сменить настроение.";
  }

  function showResult() {
    progressBar.style.width = "100%";
    progressLabel.textContent = "Готово!";
    questionsContainer.innerHTML = "";

    const ranked = [...fillings]
      .map((filling) => ({ ...filling, score: scores[filling.name] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topScore = ranked[0].score;

    resultList.innerHTML = ranked
      .map((filling, index) => {
        const meta = rankMeta[index];
        const percent = getMatchPercent(filling, index, topScore);
        const isWinner = index === 0;

        return `
        <div class="result-card ${meta.cardClass}">
          <div class="result-card__tagline">${meta.medal} ${meta.label}</div>
          <div class="result-card__header">
            <h4>${filling.name}</h4>
            <span class="match-badge ${meta.badgeClass}">${percent}% совпадение</span>
          </div>
          <p class="result-card__desc">${filling.description}</p>
          <p class="result-card__wow">
            ${isWinner ? filling.wow : getBackupReason(filling)}
          </p>
        </div>
      `;
      })
      .join("");

    const message = encodeURIComponent(
      "Здравствуйте! Я прошла подбор начинки на сайте. Хочу обсудить торт и эти варианты: " +
        ranked.map((f, i) => `${f.name} (${getMatchPercent(f, i, topScore)}%)`).join(", ")
    );

    telegramBtn.href = `https://t.me/${config.telegramUsername}?text=${message}`;

    resultBlock.classList.add("active");
    resultBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function startQuiz() {
    if (!isStarted) {
      isStarted = true;
      quizIntro.hidden = true;
      quizActive.hidden = false;
    }

    currentQuestion = 0;
    userTags = [];
    resetScores();
    resultBlock.classList.remove("active");
    renderQuestion();
  }

  function restartQuiz() {
    startQuiz();
    quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.TortodomQuiz = {
    start: startQuiz,
    restart: restartQuiz
  };

  document.getElementById("restartBtn")?.addEventListener("click", restartQuiz);
  document.getElementById("quizStartBtn")?.addEventListener("click", () => {
    startQuiz();
    quizActive.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
