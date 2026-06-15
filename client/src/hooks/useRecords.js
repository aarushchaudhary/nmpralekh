import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/axios'

export default function useRecords(endpoint) {
  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [totalCount,  setTotalCount]  = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  // Keep a ref so fetch() can always read the latest page without being
  // recreated on every page change (which would cause mutation callbacks
  // like create/update/remove to stale-close over an old fetch reference).
  const currentPageRef = useRef(currentPage)
  useEffect(() => { currentPageRef.current = currentPage }, [currentPage])

  const fetch = useCallback(async (params = {}, page = null) => {
    const activePage = page ?? currentPageRef.current
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint, {
        params: { ...params, page: activePage, page_size: pageSize }
      })
      if (res.data?.results !== undefined) {
        // paginated response
        setData(res.data.results)
        setTotalCount(res.data.count      ?? 0)
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
  }, [endpoint]) // endpoint is the only true dependency now

  // Re-fetch whenever the page changes (driven by goToPage)
  useEffect(() => { fetch({}, currentPage) }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (payload) => {
    const res = await api.post(endpoint, payload)
    // After creating, go back to page 1 so the new record is visible
    setCurrentPage(1)
    await fetch({}, 1)
    return res.data
  }, [endpoint, fetch])

  const update = useCallback(async (id, payload) => {
    const res = await api.put(`${endpoint}${id}/`, payload)
    await fetch()
    return res.data
  }, [endpoint, fetch])

  const remove = useCallback(async (id) => {
    const res = await api.delete(`${endpoint}${id}/`)
    await fetch()
    return res.data
  }, [endpoint, fetch])

  const goToPage = useCallback((page) => setCurrentPage(page), [])

  return {
    data, loading, error,
    totalCount, totalPages, currentPage,
    fetch, create, update, remove, goToPage
  }
}