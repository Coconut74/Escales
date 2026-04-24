export interface Note {
  id: string
  title: string
  content: string   // HTML (innerHTML du contentEditable)
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type MilestoneStatus = 'planned' | 'in-progress' | 'done'

export interface Milestone {
  id: string
  title: string
  date: string      // ISO
  status: MilestoneStatus
  description?: string
}

export interface Project {
  id: string
  name: string
  description: string
  targetAmount?: number
  startDate?: string
  endDate?: string
  milestones: Milestone[]
  createdAt: string // ISO
}
