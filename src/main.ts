import './styles.css'
import { initApp } from './modules/app'
import { initLeadGate } from './modules/leadGate'
import bgImage from './assets/retirementbackground.jpg'

// Set background image
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.style.backgroundImage = `url(${bgImage})`
  }
})

initApp()
initLeadGate()
