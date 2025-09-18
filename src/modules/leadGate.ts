// Lead gating functionality
export function initLeadGate() {
  console.log('Lead gate initializing...')
  
  const modal = document.getElementById('unlockModal')
  const cta = document.getElementById('unlockCTA')
  const reportSections = document.getElementById('reportSections')
  const showButton = document.getElementById('showUnlockModal')
  const closeButton = document.getElementById('closeModal')

  console.log('Elements found:', { modal: !!modal, cta: !!cta, reportSections: !!reportSections })

  // Check if already unlocked
  const isUnlocked = checkUnlockStatus()
  console.log('Is unlocked:', isUnlocked)
  
  if (isUnlocked) {
    unlockReport()
  } else {
    lockReport()
  }

  // Event listeners
  showButton?.addEventListener('click', () => {
    console.log('Show modal clicked')
    showModal()
  })
  
  closeButton?.addEventListener('click', () => {
    console.log('Close modal clicked')
    hideModal()
  })
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      console.log('Modal backdrop clicked')
      hideModal()
    }
  })

  // Expose unlock for testing
  ;(window as any).unlockReport = () => {
    console.log('Manual unlock triggered')
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
  }

  function showModal() {
    console.log('Showing modal')
    if (!modal) return
    modal.classList.add('show')
    document.body.style.overflow = 'hidden'
  }

  function hideModal() {
    console.log('Hiding modal')
    if (!modal) return
    modal.classList.remove('show')
    document.body.style.overflow = ''
  }

  function checkUnlockStatus(): boolean {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('unlocked') === 'true' || urlParams.get('submitted') === 'true') {
      console.log('Unlocked via URL param')
      localStorage.setItem('th_report_unlocked', 'true')
      return true
    }
    
    // Check localStorage
    const stored = localStorage.getItem('th_report_unlocked') === 'true'
    console.log('Stored unlock status:', stored)
    return stored
  }

  function unlockReport() {
    console.log('Unlocking report')
    if (cta) {
      cta.style.display = 'none'
      console.log('CTA hidden')
    }
    if (reportSections) {
      reportSections.classList.remove('report-locked')
      reportSections.classList.add('report-unlocked')
      console.log('Report sections unlocked')
    }
  }

  function lockReport() {
    console.log('Locking report')
    if (cta) {
      cta.style.display = 'block'
      console.log('CTA shown')
    }
    if (reportSections) {
      reportSections.classList.add('report-locked')
      reportSections.classList.remove('report-unlocked')
      console.log('Report sections locked')
    }
  }
}