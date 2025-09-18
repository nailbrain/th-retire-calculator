import './styles.css'
import { initApp } from './modules/app'

// Lead gate functionality
function initLeadGate() {
  const modal = document.getElementById('unlockModal')
  const cta = document.getElementById('unlockCTA')
  const reportSections = document.getElementById('reportSections')
  const showButton = document.getElementById('showUnlockModal')
  const closeButton = document.getElementById('closeModal')

  // Check if already unlocked
  const isUnlocked = localStorage.getItem('th_report_unlocked') === 'true'
  
  if (isUnlocked) {
    unlockReport()
  }

  showButton?.addEventListener('click', () => {
    modal?.classList.remove('hidden')
    modal?.classList.add('flex')
    
    // Auto-unlock after 15 seconds
    setTimeout(() => {
      localStorage.setItem('th_report_unlocked', 'true')
      unlockReport()
      modal?.classList.add('hidden')
      modal?.classList.remove('flex')
    }, 15000)
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

  function unlockReport() {
    if (cta) cta.style.display = 'none'
    if (reportSections) {
      reportSections.style.filter = 'none'
      reportSections.style.pointerEvents = 'auto'
    }
  }

  // Expose for testing
  ;(window as any).unlockReport = () => {
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
  }
}

initApp()
initLeadGate()
