export const API_PREFIX = '/api/v1'
export const AUTH_PREFIX = `${API_PREFIX}/auth`

// Resources
export const USERS = `${API_PREFIX}/users`
export const STUDIES = `${API_PREFIX}/studies`
export const PARTICIPANTS = `${API_PREFIX}/participants`
export const JOBS = `${API_PREFIX}/jobs`

// Misc routes
export const RECOVER_PASSWORD = `${AUTH_PREFIX}/password/recover`
export const RESET_PASSWORD = `${AUTH_PREFIX}/password/reset`
export const UPDATE_ACCOUNT = `${AUTH_PREFIX}/user`
export const UPDATE_PASSWORD = `${AUTH_PREFIX}/password`
export const VERIFY_EMAIL = `${AUTH_PREFIX}/email/verify`
export const RESEND_VERIFICATION = `${AUTH_PREFIX}/email/resend`
export const SET_LOCALE = `${AUTH_PREFIX}/user/locale`
