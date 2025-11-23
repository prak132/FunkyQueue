'use client'

import JobQueue from '@/components/JobQueue'

export default function CAMQueue() {
  return (
    <JobQueue 
      queueType="CAM"
      title="CAM Queue"
      addLink="/queue/cam/add"
      emptyMessage="No CAM jobs in queue."
    />
  )
}
