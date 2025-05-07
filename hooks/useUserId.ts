'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export function useUserId() {
  const { user } = useUser()
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserId = async () => {
      if (!user) return

      const cached = localStorage.getItem('user_id')
      if (cached) {
        setUserId(Number(cached))
        return
      }

      try {
        if (!user.sub) throw new Error('User sub is undefined')
        const res = await fetch(`/api/users/auth/${encodeURIComponent(user.sub)}`, {
          method: 'GET',
        })

        if (!res.ok) throw new Error('failed to fetch user_id')

        const data = await res.json()
        localStorage.setItem('user_id', data.data.userd_id)
        setUserId(data.data.userd_id)
      } catch (err) {
        console.error('error fetching user_id:', err)
      }
    }

    fetchUserId()
  }, [user])

  return userId
}
