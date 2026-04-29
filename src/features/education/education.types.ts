export type ResourceType = 'video' | 'podcast' | 'article' | 'bref'

export interface Resource {
  id: string
  type: ResourceType
  title: string
  author: string
  duration: string
  thumbnail: string
  url: string
}

export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'v1',
    type: 'video',
    title: 'Comprendre les ETFs',
    author: 'Damien Invest',
    duration: '10min 32s',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&q=80',
    url: 'https://www.youtube.com',
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Pourquoi on panique quand le marché baisse ?',
    author: 'Damien Invest',
    duration: '10min 32s',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&q=80',
    url: 'https://www.youtube.com',
  },
  {
    id: 'v3',
    type: 'video',
    title: 'L\'immobilier locatif expliqué simplement',
    author: 'Heu?reka',
    duration: '18min 14s',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&q=80',
    url: 'https://www.youtube.com',
  },
  {
    id: 'p1',
    type: 'podcast',
    title: 'Apprendre à structurer sa stratégie',
    author: 'Damien Invest',
    duration: '10min 32s',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=640&q=80',
    url: 'https://open.spotify.com',
  },
  {
    id: 'p2',
    type: 'podcast',
    title: 'Le risque ou la sécurité ?',
    author: 'Damien Invest',
    duration: '12min 12s',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=640&q=80',
    url: 'https://open.spotify.com',
  },
  {
    id: 'p3',
    type: 'podcast',
    title: 'Diversifier son portefeuille en 2025',
    author: 'Finance Hero',
    duration: '23min 05s',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=640&q=80',
    url: 'https://open.spotify.com',
  },
  {
    id: 'a1',
    type: 'article',
    title: 'Les 5 erreurs classiques du primo-investisseur',
    author: 'Escales',
    duration: '5min de lecture',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&q=80',
    url: 'https://www.moneyvox.fr',
  },
  {
    id: 'a2',
    type: 'article',
    title: 'Comprendre l\'assurance-vie en 2025',
    author: 'Les Échos',
    duration: '8min de lecture',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=640&q=80',
    url: 'https://www.lesechos.fr',
  },
]
