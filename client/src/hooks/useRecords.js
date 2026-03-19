import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export default function useRecords(endpoint) {
  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [totalCount,  setTotalCount]  = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  const fetch = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint, {
        params: { ...params, page: currentPage, page_size: pageSize }
      })
      if (res.data?.results !== undefined) {
        // paginated response
        setData(res.data.results)
        setTotalCount(res.data.count   ?? 0)
        setTotalPages(res.data.total_pages ?? 1)
      } else {
        // non-paginated response (some endpoints return plain arrays)
        setData(Array.isArray(res.data) ? res.data : [])
        setTotalCount(res.data.length ?? 0)
        setTotalPages(1)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [endpoint, currentPage])

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

  const goToPage = (page) => setCurrentPage(page)

  return {
    data, loading, error,
    totalCount, totalPages, currentPage,
    fetch, create, update, remove, goToPage
  }
}