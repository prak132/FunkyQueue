export interface Job {
    id: string
    created_at: string
    part_name: string
    quantity: number
    material: string
    status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold'
    priority: 'Low' | 'Medium' | 'High' | 'Urgent'
    requester: string
    notes?: string
    file_url?: string
    claimed_by?: string | null
    completed_at?: string
    type: 'Machining' | 'CAM'
    est_time?: string
    display_order?: number | null
    completion_image_url?: string | null
    description?: string | null
    g_code_url?: string | null
    drawing_url?: string | null
}
