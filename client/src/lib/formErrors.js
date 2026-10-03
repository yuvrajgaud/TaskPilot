/*
  Turns an API error into form state. The API reports validation failures as
  { details: [{ field, message }] }; we spread those under their fields so each
  message sits beneath the input that caused it. Anything without per-field
  details — a bad-credentials 401, a server error, a network failure — becomes a
  single form-level line, since there is no one field to blame.
*/
export function applyApiError(err, { setErrors, setFormError }) {
  if (Array.isArray(err?.details) && err.details.length > 0) {
    const mapped = {}
    for (const detail of err.details) {
      if (detail.field && !mapped[detail.field]) {
        mapped[detail.field] = detail.message
      }
    }
    if (Object.keys(mapped).length > 0) {
      setErrors(mapped)
      return
    }
  }
  setFormError(err?.message ?? 'Something went wrong. Please try again.')
}
