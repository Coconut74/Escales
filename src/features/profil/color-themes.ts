export type ColorTheme = 'orange' | 'indigo' | 'emerald' | 'rose' | 'violet'

export const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: 'orange',  label: 'Orange',   swatch: '#EE9044' },
  { id: 'indigo',  label: 'Indigo',   swatch: '#6366F1' },
  { id: 'emerald', label: 'Émeraude', swatch: '#10B981' },
  { id: 'rose',    label: 'Rose',     swatch: '#F43F5E' },
  { id: 'violet',  label: 'Violet',   swatch: '#8B5CF6' },
]

// Valeurs RGB espace-séparées pour les CSS custom properties (support opacity Tailwind)
export const COLOR_THEME_VARS: Record<ColorTheme, Record<string, string>> = {
  orange: {
    '--p100': '255 248 241', '--p200': '255 236 220', '--p300': '252 207 169',
    '--p400': '249 172 109', '--p500': '238 144 68',  '--p600': '225 121 36',
    '--p700': '185 84 21',   '--p800': '95 48 18',    '--p900': '44 25 20',
  },
  indigo: {
    '--p100': '224 231 255', '--p200': '199 210 254', '--p300': '165 180 252',
    '--p400': '129 140 248', '--p500': '99 102 241',  '--p600': '79 70 229',
    '--p700': '67 56 202',   '--p800': '55 48 163',   '--p900': '49 46 129',
  },
  emerald: {
    '--p100': '209 250 229', '--p200': '167 243 208', '--p300': '110 231 183',
    '--p400': '52 211 153',  '--p500': '16 185 129',  '--p600': '5 150 105',
    '--p700': '4 120 87',    '--p800': '6 95 70',     '--p900': '6 78 59',
  },
  rose: {
    '--p100': '255 228 230', '--p200': '254 205 211', '--p300': '253 164 175',
    '--p400': '251 113 133', '--p500': '244 63 94',   '--p600': '225 29 72',
    '--p700': '190 18 60',   '--p800': '159 18 57',   '--p900': '136 19 55',
  },
  violet: {
    '--p100': '237 233 254', '--p200': '221 214 254', '--p300': '196 181 253',
    '--p400': '167 139 250', '--p500': '139 92 246',  '--p600': '124 58 237',
    '--p700': '109 40 217',  '--p800': '91 33 182',   '--p900': '76 29 149',
  },
}

// Hex pour les faces SVG du graphique isométrique
export const COLOR_THEME_BARS: Record<ColorTheme, { top: string; left: string; right: string }> = {
  orange:  { top: '#E17924', left: '#B95415', right: '#5F3012' },
  indigo:  { top: '#6366F1', left: '#4F46E5', right: '#312E81' },
  emerald: { top: '#10B981', left: '#059669', right: '#064E3B' },
  rose:    { top: '#F43F5E', left: '#E11D48', right: '#881337' },
  violet:  { top: '#8B5CF6', left: '#7C3AED', right: '#4C1D95' },
}
