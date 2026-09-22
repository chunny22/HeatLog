// Shared class names for the design system's building blocks, so every page
// draws cards, buttons, chips and fields the same way.

export const pageClass = 'mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-6 pb-10'
export const pageTitleClass = 'text-[28px] leading-tight font-extrabold tracking-tight text-ink sm:text-[30px]'
export const cardClass = 'rounded-card bg-surface p-5 shadow-card sm:p-7'
export const cardTitleClass = 'text-lg font-bold text-ink'
export const panelClass = 'rounded-panel bg-inset p-4 sm:p-5'

export const labelClass = 'flex flex-col gap-2 text-[13px] font-bold text-ink-2'
export const fieldClass =
  'h-12 w-full rounded-field bg-inset px-4 text-[15px] font-medium text-ink outline-none transition-shadow placeholder:font-normal placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-accent'

const pill =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60'
export const btnPrimaryClass = `${pill} h-12 px-6 text-[15px] bg-accent text-white hover:bg-accent-hover`
export const btnSecondaryClass = `${pill} h-12 px-6 text-[15px] bg-sunken text-ink hover:bg-line`
export const btnDangerClass = `${pill} h-12 px-6 text-[15px] bg-danger text-white hover:bg-danger-hover`
export const btnSoftSmClass = `${pill} h-10 px-4 text-[13px] bg-accent-soft text-accent-ink hover:brightness-95`

const circle =
  'inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50'
export const iconBtnClass = `${circle} size-11 bg-sunken text-ink-3 hover:bg-line hover:text-ink`
export const iconBtnSmClass = `${circle} size-9 bg-sunken text-ink-3 hover:bg-line hover:text-ink`
export const iconBtnDangerClass = `${circle} size-10 bg-danger-soft text-danger-ink hover:brightness-95`

export function chipClass(active: boolean) {
  return `inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] transition-colors ${
    active ? 'bg-accent font-bold text-white' : 'bg-sunken font-semibold text-ink-2 hover:bg-line'
  }`
}

// A pill-shaped track holding two or more options, the selected one raised.
export const segmentedClass = 'flex rounded-full bg-sunken p-1'
export function segmentClass(active: boolean) {
  return `h-10 flex-1 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors ${
    active ? 'bg-selected text-ink shadow-raised' : 'text-ink-3 hover:text-ink'
  }`
}
