// Nombre que se muestra de la cuenta de Auth0 (DF-032). Con login por correo, `name` suele ser el mismo correo:
// en ese caso se prefiere el `nickname`.
export function displayName(user) {
  if (user?.name && !user.name.includes('@')) return user.name
  return user?.nickname || user?.name || 'Tu cuenta'
}

export function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}
