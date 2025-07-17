import { vi } from 'vitest'

export const useRuntimeConfig = () => ({
  public: {
    strapiUrl: 'http://localhost:1337'
  }
})

export const $fetch = vi.fn() 