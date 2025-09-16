import { housingCosts, transportCosts, lifestyleCosts, healthInsurance, FLIGHT_RETURN_COST_GBP, MEDICAL_INFLATION_RATE, cityMultipliers, VISA_DEPOSIT_THB, OPPORTUNITY_RATE, utilitiesByHousingTHB } from './data'
import type { AgeKey, HousingKey, TransportKey, CurrencyCode, CityKey } from './data'
import { updateCharts, updateAgeProjectionChart, updateBudgetPieChart } from './charts'

let currentLifestyle: keyof typeof lifestyleCosts = 'disciplined'
let flightsPerYear = 0
let currency: CurrencyCode = 'GBP'
let gbpToThbRate = 43.2 // sensible fallback
let city: CityKey = 'cm'

function formatCurrency(amountGbp: number): string {
  const value = currency === 'GBP' ? amountGbp : amountGbp * gbpToThbRate
  const code = currency === 'GBP' ? 'GBP' : 'THB'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value)
}

async function ensureRate() {
  if (currency === 'GBP') return
  const cached = localStorage.getItem('fx_gbp_thb')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.ts < 12 * 60 * 60 * 1000) {
        gbpToThbRate = parsed.rate
        return
      }
    } catch {}
  }
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=GBP&symbols=THB')
    const data = await res.json()
    if (data && data.rates && data.rates.THB) {
      gbpToThbRate = data.rates.THB
      localStorage.setItem('fx_gbp_thb', JSON.stringify({ rate: gbpToThbRate, ts: Date.now() }))
      return
    }
  } catch {}
  // Fallback to frankfurter if first API fails
  try {
    const res2 = await fetch('https://api.frankfurter.app/latest?from=GBP&to=THB')
    const data2 = await res2.json()
    if (data2 && data2.rates && data2.rates.THB) {
      gbpToThbRate = data2.rates.THB
      localStorage.setItem('fx_gbp_thb', JSON.stringify({ rate: gbpToThbRate, ts: Date.now() }))
    }
  } catch {}
}

function parseNumberInput(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement
  return parseInt(el.value, 10)
}

function setText(id: string, value: string) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function setLifestyleMessage(key: keyof typeof lifestyleCosts, savings: number) {
  const el = document.getElementById('lifestyleMessage')
  if (!el) return
  const messages: Record<string, string> = {
    disciplined: 'Great discipline. You are positioned to save significantly while maintaining a comfortable standard of living. Consider allocating a portion of savings to an emergency fund and long-term healthcare planning.',
    moderate: 'Balanced approach. Enjoyment with guardrails can work well. Set monthly caps for dining/entertainment to keep savings on track and review spending quarterly.',
    heavy: 'Warning: Frequent bar/party spending can quickly erode your budget. Cutting back even one or two nights per week could reclaim a large share of your savings.',
    luxury: 'Premium lifestyle chosen. Expect higher recurring costs. If savings are a priority, target specific luxury areas to scale back (housing, dining, or transport).',
  }
  el.textContent = messages[key] + (savings < 500 ? ' Your current selections leave a small buffer; consider a more conservative mix.' : '')
}

export function initApp() {
  // Event listeners
  ;(document.getElementById('currentBudget') as HTMLInputElement)?.addEventListener('input', () => debounceUpdate())
  ;(document.getElementById('ageGroup') as HTMLSelectElement)?.addEventListener('change', update)
  ;(document.getElementById('housingLevel') as HTMLSelectElement)?.addEventListener('change', update)
  ;(document.getElementById('transportStyle') as HTMLSelectElement)?.addEventListener('change', update)

  document.querySelectorAll<HTMLButtonElement>('#lifestyleToggles .toggle-item').forEach((item) => {
    item.addEventListener('click', function () {
      document.querySelectorAll('#lifestyleToggles .toggle-item').forEach((t) => t.classList.remove('active', 'border-white'))
      this.classList.add('active', 'border-white')
      currentLifestyle = this.dataset.lifestyle as keyof typeof lifestyleCosts
      update()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('#budgetQuick button').forEach((btn) => {
    btn.addEventListener('click', function () {
      const amount = parseInt(this.getAttribute('data-amount') || '0', 10)
      const input = document.getElementById('currentBudget') as HTMLInputElement
      input.value = String(amount)
      update()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('#flightChips .toggle-item').forEach((item) => {
    item.addEventListener('click', function () {
      document.querySelectorAll('#flightChips .toggle-item').forEach((t) => t.classList.remove('active', 'border-white'))
      this.classList.add('active', 'border-white')
      flightsPerYear = parseInt(this.dataset.flights || '0', 10)
      update()
    })
  })

  const currencySwitch = document.getElementById('currencySwitch') as HTMLInputElement | null
  if (currencySwitch) {
    const onSwitch = async () => {
      currency = currencySwitch.checked ? 'THB' : 'GBP'
      await ensureRate()
      update()
    }
    currencySwitch.addEventListener('change', onSwitch)
    currencySwitch.addEventListener('input', onSwitch)
  }

  document.querySelectorAll<HTMLButtonElement>('#cityChips .toggle-item').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#cityChips .toggle-item').forEach((t) => t.classList.remove('active', 'border-white'))
      this.classList.add('active', 'border-white')
      city = (this.getAttribute('data-city') as CityKey) || 'cm'
      update()
    })
  })

  update()
}

let debounceTimer: number | undefined
function debounceUpdate() {
  if (debounceTimer) window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(update, 300)
}

function update() {
  try {
    const currentBudget = parseNumberInput('currentBudget')
    const age = (document.getElementById('ageGroup') as HTMLSelectElement).value as AgeKey
    const housing = (document.getElementById('housingLevel') as HTMLSelectElement).value as HousingKey
    const transport = (document.getElementById('transportStyle') as HTMLSelectElement).value as TransportKey

    const baseHousing = housingCosts[housing].thai
    const housingMultiplier = cityMultipliers[city].housing
    const housingCost = Math.round(baseHousing * housingMultiplier)
    // Utilities scale by housing preference (provided in THB). Convert to GBP if needed for internal math.
    const utilitiesTHB = utilitiesByHousingTHB[housing]
    const utilitiesCost = currency === 'GBP' ? Math.round(utilitiesTHB / gbpToThbRate) : utilitiesTHB
    const transportCost = transportCosts[transport].monthly
    const selectedLifestyle = lifestyleCosts[currentLifestyle]
    const thaiFoodMid = Math.round((selectedLifestyle.thai.food[0] + selectedLifestyle.thai.food[1]) / 2)
    const thaiEntMid = Math.round((selectedLifestyle.thai.entertainment[0] + selectedLifestyle.thai.entertainment[1]) / 2)
    const lifestyleCost = thaiFoodMid + thaiEntMid
    const healthCost = healthInsurance[age].good
    const miscCost = 100

    const monthlyFlightAllocation = Math.round((FLIGHT_RETURN_COST_GBP * flightsPerYear) / 12)
    const totalThailandCost = housingCost + transportCost + lifestyleCost + healthCost + utilitiesCost + miscCost + monthlyFlightAllocation
    const monthlySavings = Math.max(0, currentBudget - totalThailandCost)
    const yearlySavings = monthlySavings * 12
    const twentyYearSavings = yearlySavings * 20
    const ageAdjustedTwentyYear = computeAgeAdjustedTwentyYearSavings({
      currentBudget,
      housingCost,
      transportCost,
      lifestyleCost,
      utilitiesCost,
      miscCost,
      age,
      medicalInflationRate: MEDICAL_INFLATION_RATE,
      flightsPerYear,
    })

    setText('monthlySavings', formatCurrency(monthlySavings))
    setText('yearlySavings', formatCurrency(yearlySavings))
    setText('twentyYearSavings', formatCurrency(twentyYearSavings))
    setText('thailandBudget', formatCurrency(totalThailandCost))
    setText('ukBudget', formatCurrency(currentBudget))

    setText('ukHousing', formatCurrency(housingCosts[housing].uk))
    setText('thaiHousing', formatCurrency(housingCost))
    setText('housingSavings', formatCurrency(housingCosts[housing].uk - housingCost))
    const cityAdj = document.getElementById('cityAdjNote')
    if (cityAdj) cityAdj.textContent = ` (${cityMultipliers[city].name}: ${Math.round((housingMultiplier - 1) * 100)}%)`

    const ukFoodMid = Math.round((selectedLifestyle.uk.food[0] + selectedLifestyle.uk.food[1]) / 2)
    const ukEntMid = Math.round((selectedLifestyle.uk.entertainment[0] + selectedLifestyle.uk.entertainment[1]) / 2)
    const ukFoodEquivalent = ukFoodMid + ukEntMid
    setText('ukFood', formatCurrency(ukFoodEquivalent))
    setText('thaiFood', formatCurrency(lifestyleCost))
    setText('foodSavings', formatCurrency(ukFoodEquivalent - lifestyleCost))

    setText('ageDisplay', age)
    setText('healthCost', formatCurrency(healthCost))
    setText('healthAnnual', formatCurrency(healthCost * 12))

    setText('transportChoice', transportCosts[transport].name)
    setText('transportCost', formatCurrency(transportCost))
    setText('transportInitial', formatCurrency(transportCosts[transport].initial))
    // Initial outlay details
    const housingDeposit = housingCost * 2
    const vehicleInitial = transportCosts[transport].initial
    const initialTotal = housingDeposit + vehicleInitial
    setText('initialVehicle', formatCurrency(vehicleInitial))
    setText('initialDeposit', formatCurrency(housingDeposit))
    setText('initialTotal', formatCurrency(initialTotal))

    // Update static labels in one-time costs to match currency
    setText('optionTaxi', formatCurrency(0) + ' (no purchase needed)')
    setText('optionScooterCost', formatCurrency(400))
    setText('optionCarCost', formatCurrency(8000))
    // Visa: fixed 800,000 THB; convert for GBP view
    const depositGbp = VISA_DEPOSIT_THB / (currency === 'GBP' ? gbpToThbRate : 1)
    const oppAnnualGbp = (depositGbp * OPPORTUNITY_RATE)
    const depositDisplay = currency === 'GBP' ? formatCurrency(depositGbp) : `฿${VISA_DEPOSIT_THB.toLocaleString()}`
    const oppDisplay = currency === 'GBP' ? `${formatCurrency(oppAnnualGbp)}/year lost returns` : `฿${Math.round(VISA_DEPOSIT_THB * OPPORTUNITY_RATE).toLocaleString()}/year lost returns`
    setText('visaDeposit', depositDisplay)
    setText('visaOppCost', oppDisplay)

    setText('currentAge', age)
    setText('currentHealthCost', formatCurrency(healthCost))
    setText('futureHealthCost', age === '70+' ? '£350+' : '£250+')
    setText('currentLifestyle', currentLifestyle)
    setLifestyleMessage(currentLifestyle, monthlySavings)

    const purchaseImpact =
      transport === 'grab'
        ? 'No purchase needed'
        : transport === 'scooter'
        ? 'One-time £400 vs £8,000 for car'
        : 'One-time £8,000 vs £400 for scooter'
    setText('transportPurchaseImpact', purchaseImpact)

    updateKeyRisks(age, currentLifestyle, monthlySavings)
    updateCharts(currentBudget, totalThailandCost, (n) => formatCurrency(n))
    updateAgeProjectionChart((n) => formatCurrency(n))
    updateBudgetPieChart(totalThailandCost, housingCost, lifestyleCost, healthCost, transportCost, utilitiesCost, (n) => formatCurrency(n))

    setText('summaryMonthlySavings', formatCurrency(monthlySavings))
    setText('summaryTwentyYear', formatCurrency(ageAdjustedTwentyYear))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Calculation update error:', error)
  }
}

function computeAgeAdjustedTwentyYearSavings(params: {
  currentBudget: number
  housingCost: number
  transportCost: number
  lifestyleCost: number
  utilitiesCost: number
  miscCost: number
  age: AgeKey
  medicalInflationRate: number
  flightsPerYear: number
}): number {
  const { currentBudget, housingCost, transportCost, lifestyleCost, utilitiesCost, miscCost, age, medicalInflationRate, flightsPerYear } = params

  const monthlyFlightAllocation = Math.round((FLIGHT_RETURN_COST_GBP * flightsPerYear) / 12)

  // Determine years in each band over a 20-year horizon
  const bands: { key: AgeKey; years: number }[] =
    age === '50s' ? [ { key: '50s', years: 10 }, { key: '60s', years: 10 } ] :
    age === '60s' ? [ { key: '60s', years: 10 }, { key: '70+', years: 10 } ] :
                    [ { key: '70+', years: 20 } ]

  let totalSavings = 0
  let monthlyNonHealth = housingCost + transportCost + lifestyleCost + utilitiesCost + miscCost + monthlyFlightAllocation

  // Start from current band's "good" premium and apply medical inflation annually
  let currentPremium: number = healthInsurance[age].good as number

  for (const band of bands) {
    for (let year = 0; year < band.years; year++) {
      // Switch band premium at the start of the first year of that band
      if (year === 0 && band.key !== age) {
        currentPremium = healthInsurance[band.key].good as number
      }
      const thailandAnnual = (monthlyNonHealth + currentPremium) * 12
      const annualSavings = Math.max(0, currentBudget * 12 - thailandAnnual)
      totalSavings += annualSavings
      // Inflate premium for next year
      currentPremium = Math.round(currentPremium * (1 + medicalInflationRate))
    }
  }

  return totalSavings
}

function updateKeyRisks(age: AgeKey, lifestyle: keyof typeof lifestyleCosts, savings: number) {
  const risks: string[] = []
  const steps: string[] = []

  if (age === '70+') {
    risks.push('High health insurance costs')
    steps.push('Consider comprehensive health planning')
  } else if (age === '60s') {
    risks.push('Rising health insurance costs')
  }

  if (lifestyle === 'heavy' || lifestyle === 'moderate') {
    risks.push('Lifestyle inflation risk')
    steps.push('Set strict entertainment budgets')
  }

  if (savings < 500) {
    risks.push('Limited safety margin')
    steps.push('Consider more budget-friendly options')
  }

  if (steps.length === 0) {
    steps.push('Plan extended 2-3 month visit', 'Research visa requirements', 'Set up Thai bank account')
  }

  setText('keyRisks', risks.join(', ') || 'Minimal risks identified')
  setText('nextSteps', steps.join(', '))
}


