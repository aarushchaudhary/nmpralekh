import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export default function useRecords(endpoint) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetch = useCallback(async (params = {}) => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(endpoint, { params })
            // handle both paginated and non-paginated responses
            setData(res.data?.results ?? res.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }, [endpoint])

    useEffect(() => { fetch() }, [fetch])

    const create = async (payload) => {
        const res = await api.post(endpoint, payload)
        await fetch()
        return res.data
    }

    const update = async (id, payload) => {
        const res = await api.put(`${endpoint}${id}/`, payload)
        await fetch()
        return res.data
    }

    const remove = async (id) => {
        const res = await api.delete(`${endpoint}${id}/`)
        await fetch()
        return res.data
    }

    return { data, loading, error, fetch, create, update, remove }
}