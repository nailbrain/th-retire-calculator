// Lead gating functionality
export function initLeadGate() {
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

  // Event listeners
  showButton?.addEventListener('click', showModal)
  closeButton?.addEventListener('click', hideModal)
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) hideModal()
  })

  // For testing - expose unlock function
  ;(window as any).unlockReport = () => {
    localStorage.setItem('th_report_unlocked', 'true')
    unlockReport()
  }

  function showModal() {
    if (!modal) return
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    
    // Auto-unlock after 10 seconds as backup
    setTimeout(() => {
      localStorage.setItem('th_report_unlocked', 'true')
      unlockReport()
      hideModal()
    }, 10000)
  }

  function hideModal() {
    if (!modal) return
    modal.style.display = 'none'
    document.body.style.overflow = ''
  }

  function unlockReport() {
    if (cta) cta.style.display = 'none'
    if (reportSections) {
      reportSections.style.filter = 'none'
      reportSections.style.pointerEvents = 'auto'
    }
  }
}