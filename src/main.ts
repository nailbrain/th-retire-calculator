import './styles.css'
import { initApp } from './modules/app'

// Lead gate functionality
function initLeadGate() {
  const modal = document.getElementById('unlockModal')
  const cta = document.getElementById('unlockCTA')
  const reportSections = document.getElementById('reportSections')
  const showButton = document.getElementById('showUnlockModal')
  const closeButton = document.getElementById('closeModal')
  const manualUnlockButton = document.getElementById('manualUnlock')

  // Check URL parameters for unlock (when returning from Kartra form)
  const urlParams = new URLSearchParams(window.location.search)
  const hasUnlockParam = urlParams.has('referrer') || urlParams.has('submitted') || urlParams.has('success') || urlParams.has('thank-you') || urlParams.has('thankyou') || urlParams.has('optin') || urlParams.has('lead')
  
  // Also check if URL contains common success indicators
  const urlString = window.location.href.toLowerCase()
  const hasSuccessUrl = urlString.includes('success') || urlString.includes('thank') || urlString.includes('submitted') || urlString.includes('optin')
  
  // Check if already unlocked or has unlock parameter
  const isUnlocked = localStorage.getItem('th_report_unlocked') === 'true' || hasUnlockParam || hasSuccessUrl
  
  // Debug logging
  console.log('URL:', window.location.href)
  console.log('URL Params:', Object.fromEntries(urlParams))
  console.log('Has unlock param:', hasUnlockParam)
  console.log('Has success URL:', hasSuccessUrl)
  console.log('Is unlocked:', isUnlocked)

  if (isUnlocked) {
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
  }

  showButton?.addEventListener('click', () => {
    modal?.classList.remove('hidden')
    modal?.classList.add('flex')
  })

  closeButton?.addEventListener('click', () => {
    modal?.classList.add('hidden')
    modal?.classList.remove('flex')
  })

  manualUnlockButton?.addEventListener('click', () => {
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
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
