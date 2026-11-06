// Inline icons, drawn in currentColor so they follow the theme.

const svg = (body: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

/** The nav button's icon: a globe. */
export const GLOBE = svg('<circle cx="8" cy="8" r="6.3"/><path d="M1.9 8h12.2"/><path d="M8 1.7c1.8 1.7 2.7 3.8 2.7 6.3S9.8 12.6 8 14.3C6.2 12.6 5.3 10.5 5.3 8S6.2 3.4 8 1.7Z"/>')

export const BACK = svg('<path d="M10 3.5 5.5 8l4.5 4.5"/>')
export const FORWARD = svg('<path d="M6 3.5 10.5 8 6 12.5"/>')
export const RELOAD = svg('<path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 2.5v3h-3"/>')
export const STOP = svg('<path d="m4 4 8 8M12 4l-8 8"/>')
export const HOME = svg('<path d="M2.5 7.5 8 3l5.5 4.5"/><path d="M4 6.5V13h8V6.5"/>')
export const STAR = svg('<path d="m8 2.2 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.3l-3.6 1.9.7-4-2.9-2.8 4-.6Z"/>')
export const STAR_ON = STAR.replace('fill="none"', 'fill="currentColor"')
