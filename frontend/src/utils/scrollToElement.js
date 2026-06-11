export const scrollToElement = (target, options = { behavior: 'smooth', block: 'start' }) => {
  const element = target?.current || target
  if (!element) return

  window.setTimeout(() => {
    element.scrollIntoView(options)
  }, 120)
}
