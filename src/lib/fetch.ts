import { useAppStore } from '@/store/app-store'

/**
 * Auth-aware fetch wrapper.
 * Automatically injects x-user-id and x-user-role headers from the Zustand store.
 * Drop-in replacement for native fetch — just change `fetch('/api/...')` to `apiFetch('/api/...')`.
 */
export function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const state = useAppStore.getState()
  const user = state.user

  const headers = new Headers(init?.headers)

  if (user) {
    if (!headers.has('x-user-id')) {
      headers.set('x-user-id', user.id)
    }
    if (!headers.has('x-user-role')) {
      headers.set('x-user-role', user.role)
    }
  }

  return fetch(input, { ...init, headers })
}
