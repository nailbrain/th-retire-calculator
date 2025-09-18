// Lead gating functionality
export function initLeadGate() {
  const modal = document.getElementById('unlockModal')
  const cta = document.getElementById('unlockCTA')
  const reportSections = document.getElementById('reportSections')
  const showButton = document.getElementById('showUnlockModal')
  const closeButton = document.getElementById('closeModal')

  // Check if already unlocked
  const isUnlocked = checkUnlockStatus()
  
  if (isUnlocked) {
    unlockReport()
  } else {
    lockReport()
  }

  // Event listeners
  showButton?.addEventListener('click', () => showModal())
  closeButton?.addEventListener('click', () => hideModal())
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) hideModal()
  })

  // Check for unlock on page load (URL params or localStorage)
  window.addEventListener('load', () => {
    if (checkUnlockStatus()) {
      unlockReport()
    }
  })

  // Periodically check if form was submitted (since Kartra redirects to same page)
  let checkInterval: number | undefined
  
  function showModal() {
    if (!modal) return
    modal.classList.add('show')
    document.body.style.overflow = 'hidden'
    
    // Start checking for form submission every 2 seconds
    checkInterval = window.setInterval(() => {
      // Check if Kartra form container has success indicators
      const kartraContainer = document.querySelector('.kartra_optin_container65ded5353c5ee48d0b7d48c591b8f430')
      if (kartraContainer) {
        // Look for success indicators in Kartra form
        const successElement = kartraContainer.querySelector('[data-success="true"], .success, .thank-you, .submitted')
        if (successElement) {
          handleFormSuccess()
        }
      }
    }, 2000)
  }

  function hideModal() {
    if (!modal) return
    modal.classList.remove('show')
    document.body.style.overflow = ''
    
    if (checkInterval) {
      window.clearInterval(checkInterval)
      checkInterval = undefined
    }
  }

  function handleFormSuccess() {
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
    hideModal()
    
    // Smooth scroll to the unlocked content
    setTimeout(() => {
      document.getElementById('reportSections')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  function checkUnlockStatus(): boolean {
    // Check URL params first (for redirect from Kartra)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('unlocked') === 'true') {
      localStorage.setItem('th_report_unlocked', 'true')
      return true
    }
    
    // Check localStorage
    return localStorage.getItem('th_report_unlocked') === 'true'
  }

  function unlockReport() {
    if (cta) cta.style.display = 'none'
    if (reportSections) {
      reportSections.classList.remove('report-locked')
      reportSections.classList.add('report-unlocked')
    }
  }

  function lockReport() {
    if (cta) cta.style.display = 'block'
    if (reportSections) {
      reportSections.classList.add('report-locked')
      reportSections.classList.remove('report-unlocked')
    }
  }
}
