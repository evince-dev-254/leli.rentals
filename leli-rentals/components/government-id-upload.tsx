"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, X } from "lucide-react"
import { userSettingsService } from "@/lib/user-settings-service"
import { useToast } from "@/hooks/use-toast"

interface GovernmentIdUploadProps {
  userId: string
  currentIdUrl?: string
  isVerified: boolean
  onVerificationChange: (verified: boolean) => void
}

export default function GovernmentIdUpload({
  userId,
  currentIdUrl,
  isVerified,
  onVerificationChange
}: GovernmentIdUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or PDF file.",
          variant: "destructive"
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // In a real implementation, this would upload to cloud storage
      // For now, we'll use the service method
      await userSettingsService.uploadGovernmentId(userId, selectedFile)

      toast({
        title: "Government ID uploaded successfully",
        description: "Your ID is being reviewed. You'll be notified once verification is complete.",
      })

      setSelectedFile(null)
      onVerificationChange(true)
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload government ID",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Government-Issued ID
        </CardTitle>
        <CardDescription>
          Upload a clear photo or scan of your government-issued ID (passport, driver's license, or national ID)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">ID Verified</div>
              <div className="text-sm text-green-600">Your government ID has been verified</div>
            </div>
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="id-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      JPEG, PNG, PDF up to 5MB
                    </span>
                  </Label>
                  <Input
                    id="id-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload ID"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}