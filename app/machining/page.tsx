'use client'

import JobQueue from '@/components/JobQueue'

export default function Home() {
  return (
    <JobQueue 
      queueType="Machining"
      title="Machining Queue"
      addLink="/queue/machining/add"
      emptyMessage="No Machining jobs in queue."
    />
  )
}
