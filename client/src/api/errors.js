// Turn a failed API call into form errors: { fieldName: 'message', _form: 'message' }.
// DRF sends field errors as { field: ['msg'] }, general ones as { detail } or
// { non_field_errors: [...] }, and some errors as a bare list.
export function apiErrors(err) {
    const data = err?.response?.data
    if (!err?.response) return { _form: 'Could not reach the server. Check your connection and try again.' }
    if (!data || typeof data === 'string') return { _form: `Something went wrong (error ${err.response.status}). Please try again.` }
    if (Array.isArray(data)) return { _form: data.join(' ') }

    const out = {}
    for (const [key, value] of Object.entries(data)) {
        out[key] = Array.isArray(value) ? value.join(' ') : String(value)
    }
    const general = [out.detail, out.non_field_errors].filter(Boolean).join(' ')
    delete out.detail
    delete out.non_field_errors
    if (general) out._form = general
    return out
}
