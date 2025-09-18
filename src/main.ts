import './styles.css'
import { initApp } from './modules/app'

// Simple lead capture modal
function initLeadCapture() {
  const modal = document.getElementById('leadModal')
  const showButton = document.getElementById('showLeadForm')
  const closeButton = document.getElementById('closeLeadModal')

  showButton?.addEventListener('click', () => {
    modal?.classList.remove('hidden')
    modal?.classList.add('flex')
  })

  closeButton?.addEventListener('click', () => {
    modal?.classList.add('hidden')
    modal?.classList.remove('flex')
  })

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
    }
  })
}

initApp()
initLeadCapture()
