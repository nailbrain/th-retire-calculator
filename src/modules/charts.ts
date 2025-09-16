import Chart from 'chart.js/auto'
import { colors, healthInsurance } from './data'

export type ChartsRegistry = {
  personalized?: Chart
  ageProjection?: Chart
  budgetPie?: Chart
}

export const charts: ChartsRegistry = {}

export function updateCharts(ukBudget: number, thaiBudget: number, format: (n: number) => string) {
  const personalizedEl = document.getElementById('personalizedChart') as HTMLCanvasElement | null
  if (!personalizedEl) return

  const ctx = personalizedEl.getContext('2d')!
  if (charts.personalized) charts.personalized.destroy()
  charts.personalized = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Your UK Budget', 'Your Thailand Budget', 'Monthly Savings'],
      datasets: [
        {
          label: 'Amount (£)',
          data: [ukBudget, thaiBudget, ukBudget - thaiBudget],
          backgroundColor: [colors.uk, colors.thailand, colors.primary],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Your Personalized Cost Comparison', font: { size: 16, weight: 'bold' } },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => format(Number(value)) },
        },
      },
    },
  })
}

export function updateAgeProjectionChart(format?: (n: number) => string) {
  const el = document.getElementById('ageProjectionChart') as HTMLCanvasElement | null
  if (!el) return
  const ctx = el.getContext('2d')!
  if (charts.ageProjection) charts.ageProjection.destroy()

  const ageData = {
    '50s': healthInsurance['50s'].good,
    '60s': healthInsurance['60s'].good,
    '70+': healthInsurance['70+'].good,
  }

  charts.ageProjection = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['50s', '60s', '70+'],
      datasets: [
        {
          label: 'Health Insurance Cost',
          data: [ageData['50s'], ageData['60s'], ageData['70+']],
          borderColor: colors.uk,
          backgroundColor: `${colors.uk}20`,
          pointBackgroundColor: colors.uk,
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 6,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Health Insurance Cost Projection by Age', font: { size: 16, weight: 'bold' } },
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => (format ? format(Number(value)) : '£' + Number(value).toLocaleString()) } },
      },
    },
  })
}

export function updateBudgetPieChart(totalCost: number, housing: number, lifestyle: number, health: number, transport: number, format: (n: number) => string) {
  const el = document.getElementById('budgetPieChart') as HTMLCanvasElement | null
  if (!el) return
  const ctx = el.getContext('2d')!
  if (charts.budgetPie) charts.budgetPie.destroy()

  const utilities = 65
  const misc = Math.max(0, totalCost - housing - lifestyle - health - transport - utilities)

  charts.budgetPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Housing', 'Food & Entertainment', 'Health Insurance', 'Transport', 'Utilities', 'Miscellaneous'],
      datasets: [
        {
          data: [housing, lifestyle, health, transport, utilities, misc],
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#95a5a6'],
          borderWidth: 3,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Your Thailand Monthly Budget Breakdown', font: { size: 16, weight: 'bold' } },
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.parsed)
              const percentage = ((value / totalCost) * 100).toFixed(1)
              return `${context.label}: ${format(value)} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}


