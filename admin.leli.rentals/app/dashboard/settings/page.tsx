'use client'

import { useUser } from '@clerk/nextjs'
import DashboardLayout from '@/components/dashboard-layout'
import { Bell, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Settings</h1>
          <p className="text-white/70">Configure your admin dashboard preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Admin Profile</h2>
                <p className="text-sm text-white/70">Your admin account information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70">Name</label>
                <div className="text-white font-medium">{user?.firstName} {user?.lastName}</div>
              </div>
              <div>
                <label className="text-sm text-white/70">Email</label>
                <div className="text-white font-medium">{user?.emailAddresses?.[0]?.emailAddress}</div>
              </div>
              <div>
                <label className="text-sm text-white/70">User ID</label>
                <div className="text-white font-mono text-sm">{user?.id}</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <p className="text-sm text-white/70">Manage notification preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-white">New User Registrations</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-white">New Bookings</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-white">Payment Updates</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            </div>
          </div>

          {/* Database */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Database</h2>
                <p className="text-sm text-white/70">Database connection status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white">Supabase Connection</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white">Real-time Updates</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
                <p className="text-sm text-white/70">Customize dashboard look</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <label className="text-sm text-white/70 block mb-2">Theme</label>
                <select title="Select dashboard theme" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="gradient" className="bg-gray-900">Gradient (Current)</option>
                  <option value="dark" className="bg-gray-900">Dark</option>
                  <option value="light" className="bg-gray-900">Light</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white/70">Dashboard Version</label>
              <div className="text-white font-medium">v1.0.0</div>
            </div>
            <div>
              <label className="text-sm text-white/70">Framework</label>
              <div className="text-white font-medium">Next.js 16</div>
            </div>
            <div>
              <label className="text-sm text-white/70">Database</label>
              <div className="text-white font-medium">Supabase PostgreSQL</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
