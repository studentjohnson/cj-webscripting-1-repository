const root = document.documentElement
const themeToggle = document.getElementById("themeToggle")
const menuBtn = document.getElementById("menuBtn")
const navLinks = document.getElementById("navLinks")

const quizQuestions = document.getElementById("quizQuestions")
const submitQuiz = document.getElementById("submitQuiz")
const quizResult = document.getElementById("quizResult")

const startOuterQuiz = document.getElementById("startOuterQuiz")
const startInnerQuiz = document.getElementById("startInnerQuiz")

const outerQuizButtons = document.querySelectorAll(".open-outer-quiz")
const innerQuizButtons = document.querySelectorAll(".open-inner-quiz")

let activeQuiz = null

const savedTheme = localStorage.getItem("theme")

if (savedTheme) {
  root.setAttribute("data-theme", savedTheme)
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {

    const currentTheme = root.getAttribute("data-theme") || "light"
    const nextTheme = currentTheme === "dark" ? "light" : "dark"

    root.setAttribute("data-theme", nextTheme)
    localStorage.setItem("theme", nextTheme)

  })
}

if (menuBtn && navLinks) {

  menuBtn.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("open")
    menuBtn.setAttribute("aria-expanded", String(isOpen))

  })

  navLinks.addEventListener("click", (event) => {

    if (event.target.tagName === "A") {
      navLinks.classList.remove("open")
      menuBtn.setAttribute("aria-expanded", "false")
    }

  })

}

const outerQuestions = [

{
question: "What sounds most like your social energy?",
answers: [
{ text: "Playful and chaotic", creature: "fox" },
{ text: "Soft and sweet", creature: "bunny" },
{ text: "Protective and steady", creature: "wolf" },
{ text: "Quiet and gentle", creature: "deer" }
]
},

{
question: "Pick your ideal weekend vibe.",
answers: [
{ text: "Exploring somewhere fun", creature: "raccoon" },
{ text: "Relaxing with snacks and blankets", creature: "cat" },
{ text: "Swimming in water", creature: "otter" },
{ text: "Something magical", creature: "dragon" }
]
},

{
question: "Which description fits your vibe?",
answers: [
{ text: "Curious and a little strange", creature: "axolotl" },
{ text: "Clever and warm", creature: "fox" },
{ text: "Comforting and gentle", creature: "bunny" },
{ text: "A mix of many moods", creature: "hybrid" }
]
}

]

const innerQuestions = [

{
question: "What do you do when life feels overwhelming?",
answers: [
{ text: "Hide away quietly", creature: "axolotl" },
{ text: "Lean on someone you trust", creature: "wolf" },
{ text: "Reflect slowly", creature: "deer" },
{ text: "Turn it into humor", creature: "fox" }
]
},

{
question: "Which feeling fits your deeper self?",
answers: [
{ text: "Warm and nurturing", creature: "otter" },
{ text: "Independent but affectionate", creature: "cat" },
{ text: "Dreamy and unusual", creature: "axolotl" },
{ text: "A mix of many moods", creature: "hybrid" }
]
},

{
question: "Where does your heart feel most at home?",
answers: [
{ text: "A quiet forest path", creature: "deer" },
{ text: "A cozy bedroom", creature: "cat" },
{ text: "A magical cave", creature: "dragon" },
{ text: "Near water with friends", creature: "otter" }
]
}

]

const creatureDescriptions = {

fox: "Playful, clever, and bright energy with a bit of chaos.",
bunny: "Sweet, comforting, gentle, and easy to trust.",
wolf: "Loyal, protective, and emotionally strong.",
deer: "Calm, thoughtful, and quietly soft-hearted.",
raccoon: "Curious, funny, and mischievous in a charming way.",
cat: "Cozy, independent, affectionate, and observant.",
otter: "Warm, nurturing, playful, and joyful.",
dragon: "Imaginative, magical, dramatic, and bold.",
axolotl: "Dreamy, unusual, sensitive, and lovable.",
hybrid: "A blend of many energies that make you unique."

}

function capitalizeCreature(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function renderQuiz(questions, title) {

  if (!quizQuestions) return

  let html = `<div class="question-block"><h3>${title}</h3></div>`

  questions.forEach((item, index) => {

    html += `
    <div class="question-block">

      <h3>${index + 1}. ${item.question}</h3>

      <div class="answer-group">

      ${item.answers.map(answer => `

        <label class="answer-option">

        <input
        type="radio"
        name="question-${index}"
        value="${answer.creature}"
        >

        ${answer.text}

        </label>

      `).join("")}

      </div>

    </div>
    `

  })

  quizQuestions.innerHTML = html

  if (quizResult) {
    quizResult.innerHTML = ""
  }

}

function startOuterQuizFlow() {

  activeQuiz = "outer"

  renderQuiz(outerQuestions, "Outer Fursona Quiz")

  document.getElementById("fursona-quiz")?.scrollIntoView({ behavior: "smooth" })

}

function startInnerQuizFlow() {

  activeQuiz = "inner"

  renderQuiz(innerQuestions, "Inner Fursona Quiz")

  document.getElementById("fursona-quiz")?.scrollIntoView({ behavior: "smooth" })

}

function getTopCreature(scores) {

  let best = ""
  let bestScore = -1

  for (const creature in scores) {

    if (scores[creature] > bestScore) {

      best = creature
      bestScore = scores[creature]

    }

  }

  return best

}

function calculateQuiz() {

  if (!activeQuiz) return

  const questions = activeQuiz === "outer" ? outerQuestions : innerQuestions

  const selectedAnswers =
  document.querySelectorAll('#quizQuestions input[type="radio"]:checked')

  if (selectedAnswers.length !== questions.length) {

    quizResult.innerHTML =
    "<p>Please answer every question first.</p>"

    return

  }

  const scores = {}

  selectedAnswers.forEach(answer => {

    const creature = answer.value

    scores[creature] = (scores[creature] || 0) + 1

  })

  const result = getTopCreature(scores)

  const prettyName = capitalizeCreature(result)

  const quizName =
  activeQuiz === "outer" ? "Outer Fursona" : "Inner Fursona"

  const description =
  creatureDescriptions[result] || ""

  quizResult.innerHTML = `
  <h3>Your ${quizName}</h3>

  <img src="images/${result}.png" alt="${prettyName} fursona">

  <p><strong>${prettyName}</strong></p>

  <p>${description}</p>
  `

}

if (startOuterQuiz) {
  startOuterQuiz.addEventListener("click", startOuterQuizFlow)
}

if (startInnerQuiz) {
  startInnerQuiz.addEventListener("click", startInnerQuizFlow)
}

outerQuizButtons.forEach(button => {
  button.addEventListener("click", startOuterQuizFlow)
})

innerQuizButtons.forEach(button => {
  button.addEventListener("click", startInnerQuizFlow)
})

if (submitQuiz) {
  submitQuiz.addEventListener("click", calculateQuiz)
}
