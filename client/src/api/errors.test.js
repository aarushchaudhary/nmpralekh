// Run with `npm test` (Node's built-in runner, no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiErrors } from './errors.js'

const failed = (status, data) => ({ response: { status, data } })

test('field errors become one message per field', () => {
    assert.deepEqual(apiErrors(failed(400, { date: ['Date has wrong format.'] })), { date: 'Date has wrong format.' })
})

test('detail becomes the form-level message', () => {
    assert.deepEqual(
        apiErrors(failed(403, { detail: 'You can only add records to your own schools.' })),
        { _form: 'You can only add records to your own schools.' },
    )
})

test('a bare list (e.g. "change already pending") becomes the form-level message', () => {
    assert.deepEqual(apiErrors(failed(400, ['A change request is already pending.'])), { _form: 'A change request is already pending.' })
})

test('non_field_errors and field errors are both kept', () => {
    assert.deepEqual(apiErrors(failed(400, { non_field_errors: ['Duplicate'], name: ['Required'] })), { name: 'Required', _form: 'Duplicate' })
})

test('an HTML error page still yields a readable message', () => {
    assert.match(apiErrors(failed(500, '<html>…</html>'))._form, /error 500/)
})

test('no response at all means the server was unreachable', () => {
    assert.match(apiErrors(new Error('Network Error'))._form, /reach the server/)
})
