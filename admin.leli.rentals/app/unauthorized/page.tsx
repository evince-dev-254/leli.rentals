import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl text-black">Access Denied</CardTitle>
                    <CardDescription className="text-black/70">
                        You don&apos;t have permission to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-black/80">
                        This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href="/"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center hover:opacity-90 transition-opacity"
                        >
                            Go to Main Site
                        </Link>
                        <Link
                            href="/sign-in"
                            className="flex-1 px-4 py-2 bg-white/20 text-black rounded-lg text-center hover:bg-white/30 transition-colors"
                        >
                            Sign In Again
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
