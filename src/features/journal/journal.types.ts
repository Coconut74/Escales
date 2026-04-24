export interface Note {
  id: string
  title: string
  content: string   // HTML (innerHTML du contentEditable)
  createdAt: string
  updatedAt: string
}

export type ProjectType = 'savings' | 'real-estate' | 'investment' | 'free' | 'loan'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface Project {
  id: string
  type: ProjectType
  name: string
  description?: string
  // Épargne + Investissement
  targetAmount?: number
  currentAmount?: number
  // Immobilier
  city?: string
  propertyType?: string
  // Investissement
  assetName?: string
  // Emprunt
  loanAmount?: number
  loanDurationMonths?: number
  loanStartDate?: string
  // Checklist (immobilier, libre)
  checklist: ChecklistItem[]
  createdAt: string
}
