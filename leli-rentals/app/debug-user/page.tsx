'use client'

import { useUser } from '@clerk/nextjs'

export default function DebugUserPage() {
    const { user, isLoaded } = useUser()

    if (!isLoaded) return <div>Loading...</div>
    if (!user) return <div>Not signed in</div>

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">User Metadata Debug</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="font-bold">Public Metadata</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(user.publicMetadata, null, 2)}
                    </pre>
                </div>
                <div>
                    <h2 className="font-bold">Unsafe Metadata</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(user.unsafeMetadata, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="font-bold mb-2">Fix Account</h2>
                <p className="mb-4 text-gray-600">Click this button to sync your verification status to the secure storage.</p>
                <button
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/debug/fix-metadata', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id })
                            })
                            const data = await res.json()
                            alert(JSON.stringify(data, null, 2))
                            window.location.reload()
                        } catch (e) {
                            alert('Error: ' + e)
                        }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Sync Metadata
                </button>
            </div>
        </div>
    )
}
