// Save and restore form state
export function saveFormState() {
  const state = {
    currentBudget: (document.getElementById('currentBudget') as HTMLInputElement)?.value,
    ageGroup: (document.getElementById('ageGroup') as HTMLSelectElement)?.value,
    housingLevel: (document.getElementById('housingLevel') as HTMLSelectElement)?.value,
    transportStyle: (document.getElementById('transportStyle') as HTMLSelectElement)?.value,
    lifestyle: document.querySelector('#lifestyleToggles .toggle-item.active')?.getAttribute('data-lifestyle'),
    city: document.querySelector('#cityChips .toggle-item.active')?.getAttribute('data-city'),
    flights: document.querySelector('#flightChips .toggle-item.active')?.getAttribute('data-flights'),
    currency: (document.getElementById('currencySwitch') as HTMLInputElement)?.checked ? 'THB' : 'GBP',
  }
  
  localStorage.setItem('th_calculator_state', JSON.stringify(state))
}

export function restoreFormState() {
  const saved = localStorage.getItem('th_calculator_state')
  if (!saved) return
  
  try {
    const state = JSON.parse(saved)
    
    // Restore input values
    const budgetInput = document.getElementById('currentBudget') as HTMLInputElement
    if (budgetInput && state.currentBudget) budgetInput.value = state.currentBudget
    
    const ageSelect = document.getElementById('ageGroup') as HTMLSelectElement
    if (ageSelect && state.ageGroup) ageSelect.value = state.ageGroup
    
    const housingSelect = document.getElementById('housingLevel') as HTMLSelectElement
    if (housingSelect && state.housingLevel) housingSelect.value = state.housingLevel
    
    const transportSelect = document.getElementById('transportStyle') as HTMLSelectElement
    if (transportSelect && state.transportStyle) transportSelect.value = state.transportStyle
    
    // Restore toggle states
    if (state.lifestyle) {
      document.querySelectorAll('#lifestyleToggles .toggle-item').forEach(t => t.classList.remove('active'))
      document.querySelector(`#lifestyleToggles [data-lifestyle="${state.lifestyle}"]`)?.classList.add('active')
    }
    
    if (state.city) {
      document.querySelectorAll('#cityChips .toggle-item').forEach(t => t.classList.remove('active'))
      document.querySelector(`#cityChips [data-city="${state.city}"]`)?.classList.add('active')
    }
    
    if (state.flights) {
      document.querySelectorAll('#flightChips .toggle-item').forEach(t => t.classList.remove('active'))
      document.querySelector(`#flightChips [data-flights="${state.flights}"]`)?.classList.add('active')
    }
    
    // Restore currency
    const currencySwitch = document.getElementById('currencySwitch') as HTMLInputElement
    if (currencySwitch && state.currency) {
      currencySwitch.checked = state.currency === 'THB'
    }
    
  } catch (error) {
    console.log('Failed to restore form state:', error)
  }
}
