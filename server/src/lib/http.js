/*
  The success side of the response contract. Every non-empty 2xx response is
  `{ "data": ... }`; deletes are 204 with no body. Errors are shaped by the
  error handler. Keeping the envelope in one place means it can't drift
  endpoint to endpoint.
*/
export const ok = (res, data, status = 200) => res.status(status).json({ data })

export const created = (res, data) => ok(res, data, 201)

export const noContent = (res) => res.status(204).end()
