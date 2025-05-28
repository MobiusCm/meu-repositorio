"use client"

import { useState } from "react"
import { MessageSquare, Award, Ban, Clock, ImageIcon, Video, Mic, LinkIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TierBadge } from "@/components/tier-badge"
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MemberDetailsProps {
  member: any
  onClose: () => void
}

export function MemberDetails({ member, onClose }: MemberDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Sample data for charts
  const activityData = [
    { date: "Mon", messages: 12 },
    { date: "Tue", messages: 19 },
    { date: "Wed", messages: 8 },
    { date: "Thu", messages: 15 },
    { date: "Fri", messages: 23 },
    { date: "Sat", messages: 10 },
    { date: "Sun", messages: 17 },
  ]

  const messageTypeData = [
    { type: "Text", count: 156 },
    { type: "Images", count: 42 },
    { type: "Videos", count: 18 },
    { type: "Audio", count: 12 },
    { type: "Links", count: 8 },
  ]

  const hourlyData = [
    { hour: "00:00", messages: 0 },
    { hour: "03:00", messages: 0 },
    { hour: "06:00", messages: 2 },
    { hour: "09:00", messages: 15 },
    { hour: "12:00", messages: 8 },
    { hour: "15:00", messages: 12 },
    { hour: "18:00", messages: 20 },
    { hour: "21:00", messages: 10 },
  ]

  const awardsHistory = [
    { date: "2023-07-15", prize: "Viagem completa", tier: "gold" },
    { date: "2023-03-22", prize: "Ingresso + Auxílio Viagem", tier: "silver" },
  ]

  const handleBanToggle = () => {
    toast({
      title: member.banned ? "Member unbanned" : "Member banned",
      description: `${member.name} has been ${member.banned ? "unbanned" : "banned"} from raffles`,
    })
  }

  return (
    <>
      <DrawerHeader className="text-left">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <DrawerTitle>{member.name}</DrawerTitle>
            <DrawerDescription className="flex items-center gap-2">
              <TierBadge tier={member.tier} />
              {member.banned && <Badge variant="destructive">Banned from Raffles</Badge>}
            </DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <div className="px-4">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{member.messages}</p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
                  <Award className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{member.awards}</p>
                  <p className="text-sm text-muted-foreground">Awards Won</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Message Types</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Text</span>
                      </div>
                      <span>156</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                        <span>Images</span>
                      </div>
                      <span>42</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-red-500" />
                        <span>Videos</span>
                      </div>
                      <span>18</span>
                    </div>
                    <Progress value={9} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Mic className="h-4 w-4 mr-2 text-amber-500" />
                        <span>Audio</span>
                      </div>
                      <span>12</span>
                    </div>
                    <Progress value={6} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Links</span>
                      </div>
                      <span>8</span>
                    </div>
                    <Progress value={4} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Most Active Times</h4>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Peak Activity</span>
                  </div>
                  <span>18:00 - 21:00</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Common Emojis</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-muted rounded-full px-3 py-1">
                    <span className="text-lg mr-1">👍</span>
                    <span className="text-xs">23</span>
                  </div>
                  <div className="flex items-center bg-muted rounded-full px-3 py-1">
                    <span className="text-lg mr-1">😂</span>
                    <span className="text-xs">18</span>
                  </div>
                  <div className="flex items-center bg-muted rounded-full px-3 py-1">
                    <span className="text-lg mr-1">❤️</span>
                    <span className="text-xs">12</span>
                  </div>
                  <div className="flex items-center bg-muted rounded-full px-3 py-1">
                    <span className="text-lg mr-1">🎉</span>
                    <span className="text-xs">8</span>
                  </div>
                  <div className="flex items-center bg-muted rounded-full px-3 py-1">
                    <span className="text-lg mr-1">🙏</span>
                    <span className="text-xs">7</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Weekly Activity</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      <Bar dataKey="messages" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Hourly Activity</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Recent Messages</h4>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm">Great news about the event!</p>
                      <span className="text-xs text-muted-foreground">Today, 14:32</span>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm">I'll be there for sure, can't wait!</p>
                      <span className="text-xs text-muted-foreground">Today, 10:15</span>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm">Does anyone know what time it starts?</p>
                      <span className="text-xs text-muted-foreground">Yesterday, 18:45</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="awards" className="space-y-6">
              {awardsHistory.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-3">Awards History</h4>
                  <div className="space-y-4">
                    {awardsHistory.map((award, index) => (
                      <div key={index} className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            <p className="font-medium">{award.prize}</p>
                          </div>
                          <TierBadge tier={award.tier} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Awarded on{" "}
                          {new Date(award.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No awards yet</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-3">Raffle Eligibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm">Gold Tier</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Eligible
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm">Silver Tier</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Eligible
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm">Bronze Tier</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Eligible
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <DrawerFooter className="flex-row justify-between gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant={member.banned ? "outline" : "destructive"} onClick={handleBanToggle}>
          <Ban className="h-4 w-4 mr-2" />
          {member.banned ? "Unban from Raffles" : "Ban from Raffles"}
        </Button>
      </DrawerFooter>
    </>
  )
}
