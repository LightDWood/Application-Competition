const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'access', 'refresh']

const sanitizeForLog = (obj) => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj !== 'object') {
    return obj
  }

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj }

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLog(sanitized[key])
    }
  }

  return sanitized
}

const sanitizeError = (error) => {
  if (!error) return error

  const sanitized = { ...error }

  if (sanitized.password) sanitized.password = '[REDACTED]'
  if (sanitized.password_hash) sanitized.password_hash = '[REDACTED]'
  if (sanitized.config?.headers?.Authorization) {
    sanitized.config.headers.Authorization = '[REDACTED]'
  }
  if (sanitized.config?.headers?.Cookie) {
    sanitized.config.headers.Cookie = '[REDACTED]'
  }

  return sanitized
}

export { sanitizeForLog, sanitizeError }
