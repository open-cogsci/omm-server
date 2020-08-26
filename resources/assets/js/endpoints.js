export const API_PREFIX = '/api/v1'

// Resources
export const USERS = `${API_PREFIX}/users`
export const STUDIES = `${API_PREFIX}/studies`
export const PARTICIPANTS = `${API_PREFIX}/participants`
export const JOBS = `${API_PREFIX}/jobs`

// Misc routes
export const RECOVER_PASSWORD = `${API_PREFIX}/auth/password/recover`
export const RESET_PASSWORD = `${API_PREFIX}/auth/password/reset`
export const UPDATE_ACCOUNT = `${API_PREFIX}/auth/user`
export const UPDATE_PASSWORD = `${API_PREFIX}/auth/password`
export const VERIFY_EMAIL = `${API_PREFIX}/auth/email/verify`
export const RESEND_VERIFICATION = `${API_PREFIX}/auth/email/resend`
export const SET_LOCALE = `${API_PREFIX}/auth/user/locale`
