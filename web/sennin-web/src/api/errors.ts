/** A failed API call. 404 means the thing does not exist; anything else means the call failed. */
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404
