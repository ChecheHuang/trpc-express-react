export const generateRegexPath = (path: string) =>
  new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`)
