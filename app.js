// ============================================================
// APP SETUP
// ============================================================

const app = document.getElementById("app");

const letters = ["A", "B", "C", "D"];

let state = {
    mode: null,
    questions: [],
    index: 0,
    answers: [],
    revealed: false,
    timeLeft: 0,
    timer: null
};


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];
    });
}


function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");

    const remainingSeconds = (seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


function clearTimer() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
}




// ============================================================
// HOME
// ============================================================

function home() {
    clearTimer();

    state = {
        mode: null,
        questions: [],
        index: 0,
        answers: [],
        revealed: false,
        timeLeft: 0,
        timer: null
    };

    

    app.innerHTML = `
        <section class="hero">

            <span class="eyebrow">
                ✦ MCQ Practice
            </span>

            <h1>
                Let’s see how much you remember.
            </h1>

            <p>
                A simple way to practise Psychology of Learning,
                check your answers, and see where you need more practice.
            </p>

        </section>


        <section class="mode-grid">

            <article class="mode-card">

                <div class="mode-icon">✓</div>

                <h2>Practice</h2>

                <p>
                    Take one question at a time and get feedback
                    right after you answer.
                </p>

                <button
                    class="btn btn-primary"
                    data-action="practice"
                >
                    Start Practice
                </button>

            </article>


            <article class="mode-card">

                <div class="mode-icon">⏱</div>

                <h2>Test</h2>

                <p>
                    Choose how many questions you want and give
                    yourself a time limit.
                </p>

                <button
                    class="btn btn-primary"
                    data-action="test"
                >
                    Start Test
                </button>

            </article>

        </section>
    `;
}


// ============================================================
// PRACTICE SETUP
// ============================================================

function practiceSetup() {
    clearTimer();

    app.innerHTML = `
        <div class="setup">

            <div class="page-head">

                <h1>Practice</h1>

                <p>
                    Pick a week or go through the whole question bank.
                </p>

            </div>


            <div class="setup-card">

                <label class="field">

                    <span>Question set</span>

                    <select id="practiceSet" class="select">

                        <option value="all">
                            All 110 questions
                        </option>

                        ${Array.from(
                            { length: 11 },
                            (_, index) => `
                                <option value="${index}">
                                    Week ${index} · 10 questions
                                </option>
                            `
                        ).join("")}

                    </select>

                </label>


                <div class="setup-actions">

                    <button
                        class="btn btn-secondary"
                        data-action="home"
                    >
                        Back
                    </button>

                    <button
                        class="btn btn-primary"
                        data-action="startPractice"
                    >
                        Start Practice
                    </button>

                </div>

            </div>

        </div>
    `;
}


// ============================================================
// START PRACTICE
// ============================================================

function startPractice() {
    const selectedSet = document.getElementById("practiceSet").value;

    const questions =
        selectedSet === "all"
            ? QUESTIONS
            : QUESTIONS.filter(
                  (question) =>
                      question.week === Number(selectedSet)
              );

    state.mode = "practice";
    state.questions = shuffle(questions);
    state.index = 0;
    state.answers = Array(questions.length).fill(null);
    state.revealed = false;

    renderPractice();
}


// ============================================================
// PRACTICE QUESTION
// ============================================================

function renderPractice() {
    const question = state.questions[state.index];
    const selectedAnswer = state.answers[state.index];

    const progress =
        ((state.index + 1) / state.questions.length) * 100;

    app.innerHTML = `
        <div class="quiz-wrap">

            <div class="quiz-top">

                <span class="progress-meta">
                    Question ${state.index + 1}
                    of ${state.questions.length}
                </span>

                <span class="progress-meta">
                    Week ${question.week}
                </span>

            </div>


            <div class="progress">
                <span style="width: ${progress}%"></span>
            </div>


            <div class="question-card">

                <div class="week-label">
                    Week ${question.week}
                </div>


                <div class="question-text">
                    ${escapeHtml(question.question)}
                </div>


                <div class="options">

                    ${question.options
                        .map((option, index) => {

                            let className = "option";

                            if (
                                state.revealed &&
                                index === question.answer
                            ) {
                                className += " correct";
                            }

                            if (
                                state.revealed &&
                                selectedAnswer === index &&
                                index !== question.answer
                            ) {
                                className += " wrong";
                            }

                            return `
                                <button
                                    class="${className}"
                                    data-option="${index}"
                                    ${state.revealed ? "disabled" : ""}
                                >

                                    <span class="option-letter">
                                        ${letters[index]}
                                    </span>

                                    <span>
                                        ${escapeHtml(option)}
                                    </span>

                                </button>
                            `;
                        })
                        .join("")}

                </div>


                ${
                    state.revealed
                        ? `
                            <div class="feedback ${
                                selectedAnswer === question.answer
                                    ? "correct"
                                    : "wrong"
                            }">

                                ${
                                    selectedAnswer === question.answer
                                        ? "✓ Correct"
                                        : "✕ Wrong"
                                }

                                ${
                                    selectedAnswer !== question.answer
                                        ? `
                                            <div class="correct-answer">
                                                Correct answer:
                                                ${letters[question.answer]}.
                                                ${escapeHtml(
                                                    question.options[
                                                        question.answer
                                                    ]
                                                )}
                                            </div>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }


                <div class="quiz-actions">

                    ${
                        state.index > 0
                            ? `
                                <button
                                    class="btn btn-secondary"
                                    data-action="prev"
                                >
                                    Previous
                                </button>
                            `
                            : `
                                <button
                                    class="btn btn-secondary"
                                    data-action="home"
                                >
                                    Exit
                                </button>
                            `
                    }


                    ${
                        state.revealed
                            ? `
                                <button
                                    class="btn btn-primary"
                                    data-action="next"
                                >
                                    ${
                                        state.index ===
                                        state.questions.length - 1
                                            ? "Finish"
                                            : "Next Question"
                                    }
                                </button>
                            `
                            : ""
                    }

                </div>

            </div>

        </div>
    `;
}


// ============================================================
// PRACTICE ANSWERS
// ============================================================

function choosePractice(index) {
    if (state.revealed) {
        return;
    }

    state.answers[state.index] = index;
    state.revealed = true;

    renderPractice();
}


function nextPractice() {
    if (state.index === state.questions.length - 1) {
        showPracticeResult();
        return;
    }

    state.index++;
    state.revealed = false;

    renderPractice();
}


function prevPractice() {
    if (state.index > 0) {
        state.index--;

        state.revealed =
            state.answers[state.index] !== null;

        renderPractice();
    }
}


// ============================================================
// PRACTICE RESULT
// ============================================================

function showPracticeResult() {
    const correct = state.answers.reduce(
        (total, answer, index) =>
            total +
            (answer === state.questions[index].answer ? 1 : 0),
        0
    );

    const attempted = state.answers.filter(
        (answer) => answer !== null
    ).length;

    const wrong = attempted - correct;

    const skipped =
        state.questions.length - attempted;

    const percentage = Math.round(
        (correct / state.questions.length) * 100
    );

    app.innerHTML = `
        <div class="result-card">

            <span class="eyebrow">
                Practice complete
            </span>


            <div class="result-score">
                ${correct}/${state.questions.length}
            </div>


            <div class="result-sub">
                ${percentage}% correct
            </div>


            <div class="stats">

                <div class="stat">
                    <strong>${correct}</strong>
                    <span>Correct</span>
                </div>

                <div class="stat">
                    <strong>${wrong}</strong>
                    <span>Wrong</span>
                </div>

                <div class="stat">
                    <strong>${skipped}</strong>
                    <span>Skipped</span>
                </div>

                <div class="stat">
                    <strong>${state.questions.length}</strong>
                    <span>Total</span>
                </div>

            </div>


            <button
                class="btn btn-primary btn-wide"
                data-action="practice"
            >
                Practice Again
            </button>


            <div style="height: 10px"></div>


            <button
                class="btn btn-secondary btn-wide"
                data-action="home"
            >
                Back Home
            </button>

        </div>
    `;
}


// ============================================================
// TEST SETUP
// ============================================================

function testSetup() {
    clearTimer();

    app.innerHTML = `
        <div class="setup">

            <div class="page-head">

                <h1>Test</h1>

                <p>
                    Choose how many questions you want to answer
                    and set a time limit.
                </p>

            </div>


            <div class="setup-card">

                <label class="field">

                    <span>Number of questions</span>

                    <select id="testCount" class="select">

                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="110">All 110</option>

                    </select>

                </label>


                <label class="field">

                    <span>Time limit</span>

                    <select id="testTime" class="select">

                        <option value="10">
                            10 minutes
                        </option>

                        <option value="20">
                            20 minutes
                        </option>

                        <option value="30" selected>
                            30 minutes
                        </option>

                        <option value="45">
                            45 minutes
                        </option>

                        <option value="60">
                            60 minutes
                        </option>

                    </select>

                </label>


                <div class="setup-actions">

                    <button
                        class="btn btn-secondary"
                        data-action="home"
                    >
                        Back
                    </button>

                    <button
                        class="btn btn-primary"
                        data-action="startTest"
                    >
                        Start Test
                    </button>

                </div>

            </div>

        </div>
    `;
}


// ============================================================
// START TEST
// ============================================================

function startTest() {
    const questionCount =
        Number(
            document.getElementById("testCount").value
        );

    const timeLimit =
        Number(
            document.getElementById("testTime").value
        );

    state.mode = "test";

    state.questions = shuffle(QUESTIONS).slice(
        0,
        Math.min(questionCount, QUESTIONS.length)
    );

    state.index = 0;

    state.answers = Array(
        state.questions.length
    ).fill(null);

    state.timeLeft = timeLimit * 60;

    renderTest();

    state.timer = setInterval(() => {

        state.timeLeft--;

        if (state.timeLeft <= 0) {
            clearTimer();
            finishTest();
            return;
        }

        const timer = document.getElementById("timer");

        if (timer) {
            timer.textContent =
                formatTime(state.timeLeft);

            timer.classList.toggle(
                "danger",
                state.timeLeft <= 60
            );
        }

    }, 1000);
}


// ============================================================
// TEST QUESTION
// ============================================================

function renderTest() {
    const question = state.questions[state.index];

    const progress =
        ((state.index + 1) / state.questions.length) * 100;

    app.innerHTML = `
        <div class="test-layout">

            <div class="quiz-wrap">

                <div class="quiz-top">

                    <span class="progress-meta">
                        Question ${state.index + 1}
                        of ${state.questions.length}
                    </span>

                    <span
                        id="timer"
                        class="timer ${
                            state.timeLeft <= 60
                                ? "danger"
                                : ""
                        }"
                    >
                        ${formatTime(state.timeLeft)}
                    </span>

                </div>


                <div class="progress">
                    <span style="width: ${progress}%"></span>
                </div>


                <div class="question-card">

                    <div class="week-label">
                        Week ${question.week}
                    </div>


                    <div class="question-text">
                        ${escapeHtml(question.question)}
                    </div>


                    <div class="options">

                        ${question.options
                            .map(
                                (option, index) => `
                                    <button
                                        class="option ${
                                            state.answers[
                                                state.index
                                            ] === index
                                                ? "correct"
                                                : ""
                                        }"
                                        data-test-option="${index}"
                                    >

                                        <span class="option-letter">
                                            ${letters[index]}
                                        </span>

                                        <span>
                                            ${escapeHtml(option)}
                                        </span>

                                    </button>
                                `
                            )
                            .join("")}

                    </div>


                    <div class="quiz-actions">

                        <button
                            class="btn btn-secondary"
                            data-action="prevTest"
                        >
                            Previous
                        </button>


                        <button
                            class="btn btn-primary"
                            data-action="nextTest"
                        >
                            ${
                                state.index ===
                                state.questions.length - 1
                                    ? "Submit Test"
                                    : "Next"
                            }
                        </button>

                    </div>

                </div>

            </div>


            <aside class="navigator">

                <h3>Questions</h3>

                <div class="palette">

                    ${state.questions
                        .map(
                            (question, index) => `
                                <button
                                    class="${
                                        index === state.index
                                            ? "active "
                                            : ""
                                    }${
                                        state.answers[index] !== null
                                            ? "answered"
                                            : ""
                                    }"
                                    data-jump="${index}"
                                >
                                    ${index + 1}
                                </button>
                            `
                        )
                        .join("")}

                </div>

            </aside>

        </div>
    `;
}


// ============================================================
// TEST ANSWERS
// ============================================================

function chooseTest(index) {
    state.answers[state.index] = index;

    renderTest();
}


function finishTest() {
    clearTimer();
    showTestResult();
}


function nextTest() {
    if (
        state.index ===
        state.questions.length - 1
    ) {
        finishTest();
        return;
    }

    state.index++;

    renderTest();
}


function prevTest() {
    if (state.index > 0) {
        state.index--;

        renderTest();
    }
}


// ============================================================
// TEST RESULT
// ============================================================

function showTestResult() {
    const correct = state.answers.reduce(
        (total, answer, index) =>
            total +
            (answer === state.questions[index].answer
                ? 1
                : 0),
        0
    );

    const attempted = state.answers.filter(
        (answer) => answer !== null
    ).length;

    const wrong = state.answers.reduce(
        (total, answer, index) =>
            total +
            (
                answer !== null &&
                answer !== state.questions[index].answer
                    ? 1
                    : 0
            ),
        0
    );

    const notAttempted =
        state.questions.length - attempted;

    const percentage = Math.round(
        (correct / state.questions.length) * 100
    );

    app.innerHTML = `
        <div class="result-card">

            <span class="eyebrow">
                Test submitted
            </span>


            <div class="result-score">
                ${correct}/${state.questions.length}
            </div>


            <div class="result-sub">
                ${percentage}% score
            </div>


            <div class="stats">

                <div class="stat">
                    <strong>${correct}</strong>
                    <span>Correct</span>
                </div>

                <div class="stat">
                    <strong>${wrong}</strong>
                    <span>Wrong</span>
                </div>

                <div class="stat">
                    <strong>${notAttempted}</strong>
                    <span>Not attempted</span>
                </div>

                <div class="stat">
                    <strong>${state.questions.length}</strong>
                    <span>Total</span>
                </div>

            </div>


            <div
                class="setup-actions"
                style="justify-content: center"
            >

                <button
                    class="btn btn-primary"
                    data-action="test"
                >
                    New Test
                </button>

                <button
                    class="btn btn-secondary"
                    data-action="home"
                >
                    Home
                </button>

            </div>


            <div class="review">

                <h2>Review</h2>

                ${state.questions
                    .map((question, index) => {

                        const answer =
                            state.answers[index];

                        return `
                            <div class="review-item">

                                <h3>
                                    ${index + 1}.
                                    ${escapeHtml(
                                        question.question
                                    )}
                                </h3>


                                <p>
                                    Your answer:
                                    <strong>
                                        ${
                                            answer === null
                                                ? "Not attempted"
                                                : `${letters[answer]}. ${escapeHtml(
                                                      question.options[
                                                          answer
                                                      ]
                                                  )}`
                                        }
                                    </strong>
                                </p>


                                ${
                                    answer !== question.answer
                                        ? `
                                            <p>
                                                Correct answer:
                                                <strong>
                                                    ${
                                                        letters[
                                                            question.answer
                                                        ]
                                                    }.
                                                    ${escapeHtml(
                                                        question.options[
                                                            question.answer
                                                        ]
                                                    )}
                                                </strong>
                                            </p>
                                        `
                                        : ""
                                }

                            </div>
                        `;
                    })
                    .join("")}

            </div>

        </div>
    `;
}


// ============================================================
// EVENT HANDLING
// ============================================================

document.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const action = button.dataset.action;


    // Navigation
    if (action === "home") {
        home();
        return;
    }

    if (action === "practice") {
        practiceSetup();
        return;
    }

    if (action === "test") {
        testSetup();
        return;
    }


    // Practice
    if (action === "startPractice") {
        startPractice();
        return;
    }

    if (action === "prev") {
        prevPractice();
        return;
    }

    if (action === "next") {
        nextPractice();
        return;
    }


    // Test
    if (action === "startTest") {
        startTest();
        return;
    }

    if (action === "nextTest") {
        nextTest();
        return;
    }

    if (action === "prevTest") {
        prevTest();
        return;
    }


    // Practice answer
    if (button.dataset.option !== undefined) {
        choosePractice(
            Number(button.dataset.option)
        );

        return;
    }


    // Test answer
    if (button.dataset.testOption !== undefined) {
        chooseTest(
            Number(button.dataset.testOption)
        );

        return;
    }


    // Question navigator
    if (button.dataset.jump !== undefined) {
        state.index =
            Number(button.dataset.jump);

        renderTest();
    }
});


// ============================================================
// START APP
// ============================================================

home();