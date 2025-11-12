import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createComplaint } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function ComplaintForm({ isOpen, onClose }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    room_no: user?.room_no || '',
    hostel_no: user?.hostel_no || '',
    query: ''
  })

  const createComplaintMutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      toast.success('Complaint submitted successfully')
      qc.invalidateQueries({ queryKey: ['r', 'complaints'] })
      onClose()
      setFormData({
        name: user?.name || '',
        room_no: user?.room_no || '',
        hostel_no: user?.hostel_no || '',
        query: ''
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.room_no || !formData.hostel_no || !formData.query) {
      toast.error('Please fill all fields')
      return
    }

    const currentDate = new Date()
    const complaintData = {
      ...formData,
      created_at: currentDate.toISOString(),
      status: 'pending'
    }

    createComplaintMutation.mutate(complaintData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-950">Submit Complaint</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-1">
                  Room No
                </label>
                <input
                  type="text"
                  name="room_no"
                  value={formData.room_no}
                  onChange={handleChange}
                  className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-1">
                  Hostel No
                </label>
                <input
                  type="text"
                  name="hostel_no"
                  value={formData.hostel_no}
                  onChange={handleChange}
                  className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-1">
                Problem/Query
              </label>
              <textarea
                name="query"
                value={formData.query}
                onChange={handleChange}
                rows={4}
                className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Describe your problem or query in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-amber-700">
              <div>
                <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Time:</span> {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border-2 border-amber-400 text-amber-800 rounded-lg font-semibold hover:bg-amber-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createComplaintMutation.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {createComplaintMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
