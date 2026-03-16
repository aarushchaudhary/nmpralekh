import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function useSchools() {
    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/schools/my-schools/')
            .then(res => setSchools(res.data))
            .catch(() => setSchools([]))
            .finally(() => setLoading(false))
    }, [])

    const schoolOptions = schools.map(s => ({
        value: s.id,
        label: s.name,
    }))

    return { schools, schoolOptions, loading }
}
