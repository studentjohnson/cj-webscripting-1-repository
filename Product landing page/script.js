const root = document.documentElement
const themeToggle = document.getElementById("themeToggle")
const menuBtn = document.getElementById("menuBtn")
const navLinks = document.getElementById("navLinks")

const quizModal = document.getElementById("quizModal")
const openModalTop = document.getElementById("openModalTop")
const openModalBottom = document.getElementById("openModalBottom")
const closeModal = document.getElementById("closeModal")

const savedTheme = localStorage.getItem("theme")

if (savedTheme) {
  root.setAttribute("data-theme", savedTheme)
}

themeToggle.addEventListener("click", () => {

  const currentTheme = root.getAttribute("data-theme") || "light"
  const nextTheme = currentTheme === "dark" ? "light" : "dark"

  root.setAttribute("data-theme", nextTheme)
  localStorage.setItem("theme", nextTheme)

})

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

function openQuizModal() {
  quizModal.hidden = false
}

function closeQuizModal() {
  quizModal.hidden = true
}

if (openModalTop) {
  openModalTop.addEventListener("click", openQuizModal)
}

if (openModalBottom) {
  openModalBottom.addEventListener("click", openQuizModal)
}

if (closeModal) {
  closeModal.addEventListener("click", closeQuizModal)
}

quizModal.addEventListener("click", (event) => {

  if (event.target === quizModal) {
    closeQuizModal()
  }

})
