export const colors = {
  uk: '#e74c3c',
  thailand: '#27ae60',
  warning: '#f39c12',
  danger: '#e67e22',
  primary: '#3498db',
}

export const housingCosts = {
  budget: { thai: 200, uk: 1000 },
  comfortable: { thai: 500, uk: 1500 },
  premium: { thai: 850, uk: 2500 },
} as const

export const transportCosts = {
  grab: { monthly: 100, initial: 0, name: 'Taxis Only' },
  scooter: { monthly: 10, initial: 400, name: 'Basic Scooter' },
  adventure: { monthly: 120, initial: 8000, name: 'Car' },
} as const

// Lifestyle costs: ranges as [min, max]; we use midpoints for calculations
export const lifestyleCosts = {
  disciplined: {
    uk: { food: [200, 250] as const, entertainment: [50, 75] as const },
    thai: { food: [133, 178] as const, entertainment: [33, 44] as const },
  },
  moderate: {
    uk: { food: [250, 300] as const, entertainment: [100, 150] as const },
    thai: { food: [178, 222] as const, entertainment: [67, 111] as const },
  },
  heavy: {
    uk: { food: [300, 350] as const, entertainment: [150, 250] as const },
    thai: { food: [222, 267] as const, entertainment: [711, 711] as const }, // heavy bar spending typical upper bound
  },
} as const

export const healthInsurance = {
  '50s': { basic: 19, good: 115 },
  '60s': { basic: 133, good: 158 },
  '70+': { basic: 192, good: 333 },
} as const

export const FLIGHT_RETURN_COST_GBP = 735

// Annual medical inflation assumption applied to health insurance in projections
export const MEDICAL_INFLATION_RATE = 0.05
export const VISA_DEPOSIT_THB = 800000
export const OPPORTUNITY_RATE = 0.03

export type AgeKey = keyof typeof healthInsurance
export type HousingKey = keyof typeof housingCosts
export type TransportKey = keyof typeof transportCosts
export type LifestyleKey = keyof typeof lifestyleCosts

export type CurrencyCode = 'GBP' | 'THB'

export const cityMultipliers = {
  cm: { name: 'Chiang Mai', housing: 1.0 },
  bkk: { name: 'Bangkok', housing: 1.55 },
  phuket: { name: 'Phuket', housing: 1.75 },
} as const

export type CityKey = keyof typeof cityMultipliers

export const utilitiesByHousingTHB = {
  budget: 1500,
  comfortable: 3500,
  premium: 5000,
} as const

export const utilitiesCosts = {
  budget: { thai: 1500, uk: 150 },
  comfortable: { thai: 3500, uk: 250 },
  premium: { thai: 5000, uk: 350 },
} as const


