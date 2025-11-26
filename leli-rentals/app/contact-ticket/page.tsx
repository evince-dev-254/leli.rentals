'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Reply,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Tag
} from 'lucide-react'

interface ContactTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: 'general' | 'technical' | 'billing' | 'booking' | 'verification' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  userId: string
  userEmail: string
  userName: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  assignedTo?: string
  adminNotes?: string
  attachments?: string[]
  responses: TicketResponse[]
}

interface TicketResponse {
  id: string
  message: string
  isFromAdmin: boolean
  adminName?: string
  createdAt: Date
  attachments?: string[]
}

const categories = [
  { value: 'general', label: 'General Inquiry', icon: '💬' },
  { value: 'technical', label: 'Technical Support', icon: '🔧' },
  { value: 'billing', label: 'Billing & Payments', icon: '💳' },
  { value: 'booking', label: 'Booking Issues', icon: '📅' },
  { value: 'verification', label: 'Account Verification', icon: '✅' },
  { value: 'other', label: 'Other', icon: '❓' }
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

const statuses = [
  { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800', icon: Clock },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
]

export default function ContactTicketPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<ContactTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(null)
  const [newResponse, setNewResponse] = useState('')

  // Form state
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchTickets = async () => {
      try {
        // Firebase removed - using empty data
        setTickets([])
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load support tickets",
          variant: "destructive"
        })
      }
    }

    fetchTickets()
  }, [user, isLoaded, toast])

  const handleCreateTicket = async () => {
    if (!user) return

    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const ticketNumber = `TKT-${Date.now()}`
      const ticketData = {
        ticketNumber,
        subject: ticketForm.subject,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: 'open',
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress || '',
        userName: user.fullName || user.firstName || 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: []
      }

      // Firebase removed - simulating ticket creation
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Support ticket created successfully. We'll get back to you soon!"
      })

      setShowCreateDialog(false)
      setTicketForm({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive"
      })
    }
  }

  const handleAddResponse = async (ticketId: string) => {
    if (!user || !newResponse.trim()) return

    try {
      const responseData = {
        message: newResponse,
        isFromAdmin: false,
        createdAt: new Date()
      }

      // Firebase removed - simulating response addition
      await new Promise(resolve => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Response added successfully"
      })

      setNewResponse('')
    } catch (error) {
      console.error('Error adding response:', error)
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    const statusInfo = statuses.find(s => s.value === status)
    if (statusInfo) {
      const Icon = statusInfo.icon
      return <Icon className="h-4 w-4" />
    }
    return <Clock className="h-4 w-4" />
  }

  const getPriorityColor = (priority: string) => {
    const priorityInfo = priorities.find(p => p.value === priority)
    return priorityInfo?.color || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const categoryInfo = categories.find(c => c.value === category)
    return categoryInfo?.icon || '❓'
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-2">Get help with your account, bookings, and more</p>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Support Tickets</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we'll help you resolve it
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={ticketForm.category} onValueChange={(value: any) => 
                      setTicketForm(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={ticketForm.priority} onValueChange={(value: any) => 
                      setTicketForm(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <span className="flex items-center space-x-2">
                              <Badge className={priority.color}>{priority.label}</Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleCreateTicket} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={statuses.find(s => s.value === ticket.status)?.color}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span>{getCategoryIcon(ticket.category)} {categories.find(c => c.value === ticket.category)?.label}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{ticket.createdAt.toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{ticket.responses.length} responses</span>
                          </span>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{ticket.description}</p>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {ticket.status !== 'closed' && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Need help? Create a support ticket and our team will assist you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={ticketForm.category} onValueChange={(value: any) => 
                  setTicketForm(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value: any) => 
                  setTicketForm(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className="flex items-center space-x-2">
                          <Badge className={priority.color}>{priority.label}</Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  rows={8}
                />
              </div>

              <Button onClick={handleCreateTicket} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Phone Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
                <div className="space-y-2">
                  <p className="font-medium">General Support</p>
                  <p className="text-2xl font-bold text-blue-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24 hours</p>
                <div className="space-y-2">
                  <p className="font-medium">General Inquiries</p>
                  <p className="text-lg font-bold text-blue-600">support@lelirentals.com</p>
                  <p className="text-sm text-gray-500">We'll get back to you soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Office Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Visit our office for in-person support</p>
                <div className="space-y-2">
                  <p className="font-medium">Leli Rentals HQ</p>
                  <p className="text-gray-700">123 Main Street<br />New York, NY 10001</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-5PM EST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Live Chat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                <p className="text-sm text-gray-500 mt-2">Available Mon-Fri 9AM-6PM EST</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTicket.subject}</DialogTitle>
              <DialogDescription>
                Ticket #{selectedTicket.ticketNumber} • Created {selectedTicket.createdAt.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="flex items-center space-x-4">
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
                <Badge className={statuses.find(s => s.value === selectedTicket.status)?.color}>
                  {getStatusIcon(selectedTicket.status)}
                  <span className="ml-1">{selectedTicket.status.replace('_', ' ')}</span>
                </Badge>
                <Badge variant="outline">
                  {getCategoryIcon(selectedTicket.category)} {categories.find(c => c.value === selectedTicket.category)?.label}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Responses */}
              <div>
                <h4 className="font-semibold mb-4">Conversation</h4>
                <div className="space-y-4">
                  {selectedTicket.responses.map((response, index) => (
                    <div key={index} className={`p-4 rounded-lg ${
                      response.isFromAdmin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {response.isFromAdmin ? 'Support Team' : 'You'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {response.createdAt.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Response */}
              {selectedTicket.status !== 'closed' && (
                <div>
                  <h4 className="font-semibold mb-2">Add Response</h4>
                  <div className="space-y-2">
                    <Textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                    />
                    <Button 
                      onClick={() => handleAddResponse(selectedTicket.id)}
                      disabled={!newResponse.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
