// Renders a module's quiz (see js/modules-data.js for the question format)
// into a container, walking one question at a time, then scores it and
// calls onSubmit({ pct, passed, missed }) once the coach submits.

function renderQuiz(container, quiz, passThreshold, onSubmit) {
  let index = 0;
  const answers = new Array(quiz.length).fill(null);

  container.innerHTML = `
    <div class="quizhead">
      <div class="eyebrow">Quiz &middot; pass ${passThreshold}% to unlock the next module</div>
      <div class="qcounter" id="qcounter"></div>
    </div>
    <div id="quizform"></div>
    <div id="quizresult" class="result" style="display:none"></div>
  `;

  const form = container.querySelector("#quizform");
  const counter = container.querySelector("#qcounter");
  const resultEl = container.querySelector("#quizresult");

  function renderQuestion() {
    const q = quiz[index];
    counter.textContent = `Question ${index + 1} of ${quiz.length}`;
    form.innerHTML = `
      <div class="stem">${q.question}</div>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label class="option${answers[index] === i ? " is-checked" : ""}">
            <input type="radio" name="q${index}" value="${i}" ${answers[index] === i ? "checked" : ""}>
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
      <div class="qactions">
        ${index > 0 ? '<button class="btn btn-outline" id="prevBtn">Back</button>' : ""}
        <button class="btn btn-primary" id="nextBtn">${index === quiz.length - 1 ? "Submit Quiz" : "Next Question"}</button>
      </div>
    `;
    form.querySelectorAll(".option input").forEach((input) => {
      input.addEventListener("change", () => {
        answers[index] = Number(input.value);
        form.querySelectorAll(".option").forEach((opt, i) => opt.classList.toggle("is-checked", i === Number(input.value)));
      });
    });
    const prevBtn = form.querySelector("#prevBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { index--; renderQuestion(); });
    form.querySelector("#nextBtn").addEventListener("click", () => {
      if (index < quiz.length - 1) { index++; renderQuestion(); }
      else { submit(); }
    });
  }

  async function submit() {
    let correct = 0;
    const missed = [];
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
      else missed.push(i);
    });
    const pct = Math.round((correct / quiz.length) * 100);
    const passed = pct >= passThreshold;

    form.style.display = "none";
    resultEl.style.display = "flex";
    resultEl.style.flexDirection = "column";
    resultEl.innerHTML = `
      <div class="banner ${passed ? "pass" : "fail"}">
        <div>
          <div class="score">${pct}%</div>
          <div class="label">${passed ? "Passed" : `Not yet, ${passThreshold}% needed`}</div>
        </div>
      </div>
      ${missed.length
        ? missed.map((i) => `
            <div class="reviewitem">
              <div class="q">${i + 1}. ${quiz[i].question}</div>
              <div class="a wrong">Your answer: ${answers[i] === null ? "No answer selected" : quiz[i].options[answers[i]]}</div>
              <div class="a right">Correct answer: ${quiz[i].options[quiz[i].correctIndex]}</div>
            </div>
          `).join("")
        : '<div class="reviewitem"><div class="a right">Clean sweep, all correct.</div></div>'
      }
      <div class="help" id="saveState">Saving your result...</div>
      <div class="resultactions">
        <button class="btn btn-outline" id="retakeBtn">Retake Quiz</button>
        ${passed ? '<a class="btn btn-primary" href="index.html">Back to Modules</a>' : ""}
      </div>
    `;
    resultEl.querySelector("#retakeBtn").addEventListener("click", () => {
      answers.fill(null);
      index = 0;
      resultEl.style.display = "none";
      form.style.display = "block";
      renderQuestion();
    });

    // Tell the coach plainly whether the result actually saved. Without this,
    // a failed write still shows "Passed" and the progress silently vanishes.
    const saveState = resultEl.querySelector("#saveState");
    try {
      await onSubmit({ pct, passed, missed });
      saveState.textContent = "Result saved.";
    } catch (err) {
      saveState.className = "error";
      saveState.textContent = "We could not save this result, so it was not recorded. Check your connection and take the quiz again.";
    }
  }

  renderQuestion();
}
