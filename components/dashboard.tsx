"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  BarChart,
  MessageSquare,
  Users,
  Award,
  Gift,
  Upload,
  Calendar,
  Search,
  Download,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  FileText,
  ImageIcon,
  MoreHorizontal,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { FileUploader } from "@/components/file-uploader"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { RaffleWheel } from "@/components/raffle-wheel"
import { SentimentAnalysis } from "@/components/sentiment-analysis"
import { MemberDetails } from "@/components/member-details"
import { TierBadge } from "@/components/tier-badge"
import { useToast } from "@/components/ui/use-toast"
import { LogoutButton } from "@/components/ui/logout-button"
import { OmnysLogo } from "@/components/ui/omnys-logo"

import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [ignoreGhost, setIgnoreGhost] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleFileUpload = (file: File) => {
    setIsLoading(true)

    // Simulate file processing
    setTimeout(() => {
      setIsLoading(false)
      setFileUploaded(true)
      toast({
        title: "Chat history uploaded",
        description: "Successfully processed WhatsApp chat history",
      })
    }, 1500)
  }

  const handleExport = (format: string) => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your data is being prepared for download",
    })

    // Simulate export
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Your data has been exported as ${format.toUpperCase()}`,
      })
    }, 1000)
  }

  const handleMemberClick = (member: any) => {
    setSelectedMember(member)
    setMemberDrawerOpen(true)
  }

  // Sample data for charts
  const activityData = [
    { date: "Mon", messages: 120, media: 30 },
    { date: "Tue", messages: 150, media: 40 },
    { date: "Wed", messages: 180, media: 45 },
    { date: "Thu", messages: 130, media: 35 },
    { date: "Fri", messages: 190, media: 50 },
    { date: "Sat", messages: 220, media: 60 },
    { date: "Sun", messages: 170, media: 45 },
  ]

  const messageTypeData = [
    { name: "Text", value: 65 },
    { name: "Images", value: 15 },
    { name: "Videos", value: 8 },
    { name: "Audio", value: 7 },
    { name: "Links", value: 5 },
  ]

  const hourlyActivityData = [
    { hour: "00:00", messages: 5 },
    { hour: "02:00", messages: 3 },
    { hour: "04:00", messages: 2 },
    { hour: "06:00", messages: 8 },
    { hour: "08:00", messages: 20 },
    { hour: "10:00", messages: 35 },
    { hour: "12:00", messages: 42 },
    { hour: "14:00", messages: 38 },
    { hour: "16:00", messages: 45 },
    { hour: "18:00", messages: 50 },
    { hour: "20:00", messages: 35 },
    { hour: "22:00", messages: 15 },
  ]

  const topMembersData = [
    { id: 1, name: "João Silva", messages: 342, tier: "gold", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 2, name: "Maria Oliveira", messages: 289, tier: "gold", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 3, name: "Carlos Santos", messages: 256, tier: "silver", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 4, name: "Ana Pereira", messages: 231, tier: "silver", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 5, name: "Lucas Costa", messages: 198, tier: "bronze", avatar: "/placeholder.svg?height=40&width=40" },
  ]

  const membersData = [
    {
      id: 1,
      name: "João Silva",
      messages: 342,
      tier: "gold",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 3,
    },
    {
      id: 2,
      name: "Maria Oliveira",
      messages: 289,
      tier: "gold",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 2,
    },
    {
      id: 3,
      name: "Carlos Santos",
      messages: 256,
      tier: "silver",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 1,
    },
    {
      id: 4,
      name: "Ana Pereira",
      messages: 231,
      tier: "silver",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 1,
    },
    {
      id: 5,
      name: "Lucas Costa",
      messages: 198,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 0,
    },
    {
      id: 6,
      name: "Juliana Almeida",
      messages: 187,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: true,
      awards: 0,
    },
    {
      id: 7,
      name: "Roberto Ferreira",
      messages: 175,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 0,
    },
    {
      id: 8,
      name: "Fernanda Lima",
      messages: 162,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 0,
    },
    {
      id: 9,
      name: "Ricardo Gomes",
      messages: 154,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 0,
    },
    {
      id: 10,
      name: "Patricia Souza",
      messages: 143,
      tier: "bronze",
      avatar: "/placeholder.svg?height=40&width=40",
      banned: false,
      awards: 0,
    },
  ]

  const awardsData = [
    { id: 1, date: "2023-07-15", member: "João Silva", prize: "Viagem completa", tier: "gold", hash: "8f7d6c5e..." },
    {
      id: 2,
      date: "2023-06-20",
      member: "Maria Oliveira",
      prize: "Ingresso + Auxílio Viagem",
      tier: "silver",
      hash: "3a2b1c0d...",
    },
    { id: 3, date: "2023-05-10", member: "Carlos Santos", prize: "Camisa", tier: "bronze", hash: "9e8d7c6b..." },
    { id: 4, date: "2023-04-05", member: "Ana Pereira", prize: "Pix R$100", tier: "bronze", hash: "5f4e3d2c..." },
    {
      id: 5,
      date: "2023-03-22",
      member: "João Silva",
      prize: "Ingresso + Auxílio Viagem",
      tier: "silver",
      hash: "1a2b3c4d...",
    },
    { id: 6, date: "2023-02-14", member: "Maria Oliveira", prize: "Camisa", tier: "bronze", hash: "7g6f5e4d..." },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const renderDashboard = () => (
    <>
      {!fileUploaded ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-2">Welcome to WhatsApp Insights</h2>
            <p className="text-muted-foreground mb-6">
              Upload your WhatsApp chat export to analyze group activity, member engagement, and more.
            </p>
            <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <p className="text-muted-foreground">Overview of your WhatsApp group activity</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <DatePickerWithRange />
              <div className="flex items-center gap-2">
                <Switch id="ghost" checked={ignoreGhost} onCheckedChange={setIgnoreGhost} />
                <Label htmlFor="ghost">Ignore ghost messages</Label>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                    <p className="text-3xl font-bold">1,248</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">12%</span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    <p className="text-3xl font-bold">28</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">4%</span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Media Shared</p>
                    <p className="text-3xl font-bold">305</p>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-full">
                    <ImageIcon className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">18%</span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Daily</p>
                    <p className="text-3xl font-bold">178</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <BarChart className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">7%</span>
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Activity Over Time</CardTitle>
                  <Select defaultValue="week">
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          padding: "8px 12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="#0284c7"
                        fillOpacity={1}
                        fill="url(#colorMessages)"
                      />
                      <Area type="monotone" dataKey="media" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMedia)" />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Messages</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm">Media</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Message Types</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={messageTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {messageTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          padding: "8px 12px",
                        }}
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {messageTypeData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-1"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">
                        {entry.name}: {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Activity and Top Members */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>When the group is most active</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={hourlyActivityData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          padding: "8px 12px",
                        }}
                      />
                      <Bar dataKey="messages" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Engagers</CardTitle>
                <CardDescription>Most active members</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {topMembersData.map((member, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{member.name}</p>
                          <TierBadge tier={member.tier} />
                        </div>
                        <div className="flex items-center">
                          <Progress
                            value={(member.messages / topMembersData[0].messages) * 100}
                            className="h-2 flex-grow"
                          />
                          <span className="ml-2 text-sm text-muted-foreground">{member.messages}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => setActiveSection("members")}>
                  View All Members
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Group Sentiment</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Analyze Sentiment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <SentimentAnalysis />
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>Analyze the emotional tone of conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Run sentiment analysis to see insights</p>
                  <p className="text-sm text-muted-foreground">
                    Discover the emotional tone of your group chat and get AI-powered insights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )

  const renderMembers = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Members</h2>
          <p className="text-muted-foreground">Manage and analyze group members</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-10 w-full md:w-[250px]" />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>Add a new member to track in your analytics.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" placeholder="Full name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input id="phone" placeholder="WhatsApp phone number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tier" className="text-right">
                    Tier
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea id="notes" placeholder="Additional information" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => {
                    toast({
                      title: "Member added",
                      description: "New member has been added successfully",
                    })
                  }}
                >
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Awards</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersData.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMemberClick(member)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.messages}</TableCell>
                  <TableCell>
                    <TierBadge tier={member.tier} />
                  </TableCell>
                  <TableCell>{member.awards}</TableCell>
                  <TableCell>
                    {member.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-600 hover:bg-green-50 border-green-200"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMemberClick(member)
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toast({
                              title: member.banned ? "Member unbanned" : "Member banned",
                              description: `${member.name} has been ${member.banned ? "unbanned" : "banned"} from raffles`,
                            })
                          }}
                        >
                          {member.banned ? "Unban from Raffles" : "Ban from Raffles"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toast({
                              title: "Member removed",
                              description: `${member.name} has been removed from tracking`,
                              variant: "destructive",
                            })
                          }}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={memberDrawerOpen} onOpenChange={setMemberDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          {selectedMember && <MemberDetails member={selectedMember} onClose={() => setMemberDrawerOpen(false)} />}
        </DrawerContent>
      </Drawer>
    </>
  )

  const renderAwards = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Awards</h2>
          <p className="text-muted-foreground">History of all raffles and awards</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-8 relative">
              {awardsData.map((award, index) => (
                <div key={index} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <h3 className="font-semibold">{award.prize}</h3>
                        <TierBadge tier={award.tier} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(award.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <p className="mb-2">
                      Awarded to <span className="font-medium">{award.member}</span>
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FileText className="h-3 w-3 mr-1" />
                      Hash: {award.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )

  const renderRaffle = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Raffle</h2>
          <p className="text-muted-foreground">Run live raffles for your group members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Raffle Settings</CardTitle>
              <CardDescription>Configure and run your raffle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier">Select Tier</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="tier">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="gold">Gold (Viagem completa)</SelectItem>
                        <SelectItem value="silver">Silver (Ingresso + Auxílio)</SelectItem>
                        <SelectItem value="bronze">Bronze (Camisa / Pix R$100)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize">Prize</Label>
                    <Input id="prize" placeholder="Enter prize description" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="exclude-banned" defaultChecked />
                  <Label htmlFor="exclude-banned">Exclude banned members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="min-messages" defaultChecked />
                  <Label htmlFor="min-messages">Require minimum 1 message in selected period</Label>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Eligible Members</p>
                  <p className="text-sm text-muted-foreground">24 members are eligible for this raffle</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg">
                Start Raffle
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raffle Wheel</CardTitle>
              <CardDescription>Visual representation of the raffle</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RaffleWheel />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Winners</CardTitle>
              <CardDescription>Winners from this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Gold Tier</p>
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      Viagem completa
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="João Silva" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">João Silva</p>
                      <p className="text-xs text-muted-foreground">Drawn at 14:32</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Silver Tier</p>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                      Ingresso + Auxílio
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Maria Oliveira" />
                      <AvatarFallback>MO</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Maria Oliveira</p>
                      <p className="text-xs text-muted-foreground">Drawn at 14:28</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveSection("awards")}>
                View All Awards
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Session cleared",
                    description: "All session winners have been cleared",
                  })
                }}
              >
                Clear Session
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Verification hashes for transparency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted rounded border font-mono text-xs overflow-x-auto">
                  <p>8f7d6c5e4b3a2f1e0d9c8b7a6...</p>
                </div>
                <div className="p-2 bg-muted rounded border font-mono text-xs overflow-x-auto">
                  <p>3a2b1c0d9e8f7g6h5i4j3k2l1...</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Each raffle generates a unique SHA-256 hash for verification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-background"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile ? "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out" : "w-64"
        } ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"} bg-background border-r flex flex-col`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-6 border-b">
          <OmnysLogo size="lg" />
          <p className="text-sm text-muted-foreground">WhatsApp Insights</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                activeSection === "dashboard" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <BarChart className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("members")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                activeSection === "members" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Members
            </button>
            <button
              onClick={() => setActiveSection("awards")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                activeSection === "awards" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Award className="mr-3 h-5 w-5" />
              Awards
            </button>
            <button
              onClick={() => setActiveSection("raffle")}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
                activeSection === "raffle" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Gift className="mr-3 h-5 w-5" />
              Raffle
            </button>
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setFileUploaded(false)
                toast({
                  title: "Data cleared",
                  description: "All uploaded data has been cleared",
                })
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">
              {activeSection === "dashboard"
                ? "Dashboard"
                : activeSection === "members"
                  ? "Members"
                  : activeSection === "awards"
                    ? "Awards"
                    : "Raffle"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {fileUploaded && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Chat
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-4">Upload WhatsApp Chat</h3>
                    <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton variant="ghost" className="w-full justify-start px-2 cursor-pointer" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "members" && renderMembers()}
          {activeSection === "awards" && renderAwards()}
          {activeSection === "raffle" && renderRaffle()}
        </main>
      </div>
    </div>
  )
}
