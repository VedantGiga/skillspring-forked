"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Briefcase,
  Users,
  MessageSquare,
  LogOut,
  Bot,
  Send,
  GraduationCap,
  Zap,
  Trophy,
  Activity,
  MapPin,
  DollarSign,
  Brain,
  FileText,
  ThumbsUp,
  Plus
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ResumeUpload } from "@/components/resume-upload"
import { CertificateTracker } from "@/components/certificate-tracker"
import { FreeResourcesHub } from "@/components/free-resources-hub"
import { LearningFoldersManager } from "@/components/learning-folders-manager"
import { AppliedApplicationsTracker } from "@/components/applied-applications-tracker"
import { useToast } from "@/hooks/use-toast"

interface LearningPath {
  id: string
  title: string
  description: string
  progress: number
  estimatedTime: string
  difficulty: string
  skills: string[]
  status: 'not_started' | 'in_progress' | 'completed'
  lastAccessed?: string
}

interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  salary: string
  match: number
  skills: string[]
  platform: string
  type: 'job' | 'internship'
  applied?: boolean
  appliedAt?: string
}

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ActivityLog {
  id: string
  type: 'course_completed' | 'job_applied' | 'certificate_earned' | 'ai_interaction' | 'login'
  title: string
  description: string
  timestamp: Date
  icon: any
  color: string
}

interface LiveOpportunity {
  id: string
  title: string
  company: string
  location: string
  type: 'job' | 'internship' | 'hackathon'
  posted_date: string
  apply_url: string
  tags: string[]
  description: string
  salary?: string
  prize_money?: string
  deadline?: string
  platform: string
}

export function IndividualDashboard() {
  const { user, logout } = useAuth()
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [careerScore, setCareerScore] = useState(85)
  const [averageProgress, setAverageProgress] = useState(0)
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi ${user?.email?.split('@')[0]}! 👋 I'm your AI Career Assistant. I can help you with career advice, job recommendations, interview prep, and skill development. What would you like to know?`,
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [liveOpportunities, setLiveOpportunities] = useState<{
    jobs: LiveOpportunity[]
    internships: LiveOpportunity[]
    hackathons: LiveOpportunity[]
    last_updated?: string
  }>({ jobs: [], internships: [], hackathons: [] })
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)
  const { toast } = useToast()

  const [showAddPath, setShowAddPath] = useState(false)
  const [newPathTitle, setNewPathTitle] = useState('')
  const [newPathDescription, setNewPathDescription] = useState('')
  const [newPathDifficulty, setNewPathDifficulty] = useState('Beginner')

  const handleLogout = async () => {
    try {
      await logout()
      // Log activity
      const logActivity = {
        id: Date.now().toString(),
        type: 'login' as const,
        title: 'Logged out',
        description: 'Successfully logged out of your account',
        timestamp: new Date(),
        icon: LogOut,
        color: 'text-gray-400'
      }
      setActivityLogs(prev => [logActivity, ...prev])

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchLiveOpportunities = async () => {
    if (!user) return

    setOpportunitiesLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/opportunities/live', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLiveOpportunities(data)

        toast({
          title: "Opportunities Updated!",
          description: `Found ${data.total_count?.jobs || 0} jobs, ${data.total_count?.internships || 0} internships, and ${data.total_count?.hackathons || 0} hackathons`,
        })
      }
    } catch (error) {
      console.error('Error fetching live opportunities:', error)
      toast({
        title: "Update Failed",
        description: "Could not fetch latest opportunities. Using cached data.",
        variant: "destructive"
      })
    } finally {
      setOpportunitiesLoading(false)
    }
  }

  const handleAddLearningPath = async () => {
    if (!newPathTitle.trim() || !newPathDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    const newPath: LearningPath = {
      id: Date.now().toString(),
      title: newPathTitle,
      description: newPathDescription,
      progress: 0,
      estimatedTime: '8-12 weeks',
      difficulty: newPathDifficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      skills: [],
      status: 'not_started',
      lastAccessed: new Date().toISOString()
    }

    setLearningPaths(prev => [...prev, newPath])
    setShowAddPath(false)
    setNewPathTitle('')
    setNewPathDescription('')
    setNewPathDifficulty('Beginner')

    toast({
      title: "Success!",
      description: "Learning path added successfully"
    })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    }

    setAiMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setAiLoading(true)

    // Log AI interaction
    const logActivity = {
      id: Date.now().toString(),
      type: 'ai_interaction' as const,
      title: 'AI Career Assistant',
      description: `Asked: "${newMessage.trim().substring(0, 50)}${newMessage.trim().length > 50 ? '...' : ''}"`,
      timestamp: new Date(),
      icon: Bot,
      color: 'text-purple-400'
    }
    setActivityLogs(prev => [logActivity, ...prev])

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/chat/student-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            role: user?.role,
            profession: user?.email?.split('@')[0]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setAiMessages(prev => [...prev, assistantMessage])
      setAiLoading(false)

    } catch (error) {
      setAiLoading(false)

      // Fallback response if API fails
      const fallbackMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm here to help with your career journey! I can assist with:

🎯 **Career Guidance**: Path recommendations, goal setting
📚 **Learning**: Course suggestions, skill development  
💼 **Job Search**: Resume tips, interview prep
📊 **Market Insights**: Salary data, industry trends

What would you like to explore today? 🚀`,
        timestamp: new Date()
      }

      setAiMessages(prev => [...prev, fallbackMessage])

      toast({
        title: "Using Offline Mode",
        description: "AI assistant is running in offline mode. Full features available online.",
        variant: "default"
      })
    }
  }

  const handleJobApply = (jobId: string) => {
    setJobRecommendations(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, applied: true, appliedAt: new Date().toISOString() }
        : job
    ))

    const job = jobRecommendations.find(j => j.id === jobId)
    if (job) {
      const logActivity = {
        id: Date.now().toString(),
        type: 'job_applied' as const,
        title: 'Job Application',
        description: `Applied to ${job.title} at ${job.company}`,
        timestamp: new Date(),
        icon: Briefcase,
        color: 'text-blue-400'
      }
      setActivityLogs(prev => [logActivity, ...prev])

      toast({
        title: "Application Submitted!",
        description: `Applied to ${job.title} at ${job.company}`,
      })
    }
  }

  const handleContinueLearning = (pathId: string) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id === pathId) {
        const newProgress = Math.min(path.progress + 10, 100)
        const newStatus = newProgress === 100 ? 'completed' : 'in_progress'

        if (newProgress === 100) {
          const logActivity = {
            id: Date.now().toString(),
            type: 'course_completed' as const,
            title: 'Course Completed!',
            description: `Finished ${path.title}`,
            timestamp: new Date(),
            icon: GraduationCap,
            color: 'text-green-400'
          }
          setActivityLogs(prevLogs => [logActivity, ...prevLogs])
        }

        return {
          ...path,
          progress: newProgress,
          status: newStatus,
          lastAccessed: new Date().toISOString()
        }
      }
      return path
    }))

    toast({
      title: "Progress Updated!",
      description: "Keep up the great work!",
    })
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token')

        // Fetch learning paths from backend
        const learningResponse = await fetch('/api/learning/paths', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Fetch job recommendations from backend
        const jobsResponse = await fetch('/api/jobs/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/student/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (learningResponse.ok) {
          const learningData = await learningResponse.json()
          const formattedPaths = learningData.paths.map((path: any) => ({
            ...path,
            status: path.progress === 0 ? 'not_started' : 
                   path.progress === 100 ? 'completed' : 'in_progress'
          }))
          setLearningPaths(formattedPaths)

          // Calculate average progress
          const avgProgress = Math.round(
            formattedPaths.reduce((acc: number, path: any) => acc + path.progress, 0) / formattedPaths.length
          )
          setAverageProgress(avgProgress)
        }

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          const formattedJobs = jobsData.jobs.map((job: any) => ({
            ...job,
            type: job.title.toLowerCase().includes('intern') ? 'internship' : 'job'
          }))
          setJobRecommendations(formattedJobs)
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setCareerScore(statsData.career_score)
          setAverageProgress(statsData.average_progress)
        }

        // Create activity logs from real user interactions
        const realActivityLogs: ActivityLog[] = [
          {
            id: '1',
            type: 'login',
            title: 'Login Activity',
            description: `Logged in at ${new Date().toLocaleTimeString()}`,
            timestamp: new Date(),
            icon: LogOut,
            color: 'text-blue-400'
          }
        ]
        setActivityLogs(realActivityLogs)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)

        // Fallback to mock data if API fails
        const fallbackPaths: LearningPath[] = [
          {
            id: '1',
            title: 'Full-Stack Web Development',
            description: 'Master React, Node.js, and modern web technologies',
            progress: 35,
            estimatedTime: '12 weeks',
            difficulty: 'Intermediate',
            skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
            status: 'in_progress',
            lastAccessed: '2024-01-20T10:30:00Z'
          }
        ]
        setLearningPaths(fallbackPaths)
        setAverageProgress(35)
      } finally {
        setLoading(false)
      }
    }

    const setupRealTimeUpdates = () => {
      // Set up periodic refresh for real-time data
      const interval = setInterval(() => {
        fetchDashboardData()
        fetchLiveOpportunities()
      }, 30000) // Refresh every 30 seconds

      return interval
    }

    if (user) {
      fetchDashboardData()
      fetchLiveOpportunities()
      const interval = setupRealTimeUpdates()

      return () => clearInterval(interval)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your learning journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Welcome back, {user?.email?.split('@')[0]}! 🚀
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Continue your learning journey with SkillSpring AI</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white w-full sm:w-auto"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Job Matches */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Job Matches</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">{jobRecommendations.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
              </div>
              <Progress value={jobRecommendations.length * 5} className="mt-3 sm:mt-4" />
            </CardContent>
          </Card>

          {/* Average Progress */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Avg Progress</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{averageProgress}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
              </div>
              <Progress value={averageProgress} className="mt-3 sm:mt-4" />
            </CardContent>
          </Card>

          {/* AI Interactions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">AI Interactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-400">{aiMessages.length - 1}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-900/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                </div>
              </div>
              <Progress value={(aiMessages.length - 1) * 10} className="mt-3 sm:mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-gray-900/50 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-blue-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-purple-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Applied Applications
            </TabsTrigger>
            <TabsTrigger value="live-opportunities" className="data-[state=active]:bg-pink-600">
              <Zap className="w-4 h-4 mr-2" />
              Live Opportunities
            </TabsTrigger>
            <TabsTrigger value="resume" className="data-[state=active]:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Resume
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-red-600">
              <Trophy className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600">
              <Zap className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/50">
                          <log.icon className={`w-5 h-5 ${log.color}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.title}</p>
                            <p className="text-xs text-gray-400">{log.description}</p>
                            <p className="text-xs text-gray-500">{log.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningPaths.map((path) => (
                      <div key={path.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{path.title}</span>
                          <span className="text-xs text-gray-400">{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <Badge variant={path.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {path.status.replace('_', ' ')}
                          </Badge>
                          {path.status === 'in_progress' && (
                            <Button size="sm" variant="outline" onClick={() => handleContinueLearning(path.id)}>
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {/* Learning Paths Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Learning Paths</h2>
                <Button 
                  onClick={() => setShowAddPath(true)}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning Path
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {learningPaths.map((path) => (
                  <Card key={path.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">{path.title}</CardTitle>
                        <Badge 
                          variant={path.difficulty === 'Beginner' ? 'secondary' : 
                                  path.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {path.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {path.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {path.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{path.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-400">
                          {path.estimatedTime}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleContinueLearning(path.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {path.status === 'completed' ? 'Review' : 'Continue'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Applied Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <AppliedApplicationsTracker />
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <ResumeUpload />
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <CertificateTracker />
          </TabsContent>

          {/* Live Opportunities Tab */}
          <TabsContent value="live-opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-pink-400 flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Live Opportunities Hub
              </h2>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchLiveOpportunities}
                  disabled={opportunitiesLoading}
                >
                  {opportunitiesLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
                {liveOpportunities.last_updated && (
                  <Badge variant="outline" className="text-xs">
                    Updated: {new Date(liveOpportunities.last_updated).toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="jobs" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jobs" className="text-xs sm:text-sm">
                  Jobs ({liveOpportunities.jobs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="internships" className="text-xs sm:text-sm">
                  Internships ({liveOpportunities.internships?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="hackathons" className="text-xs sm:text-sm">
                  Hackathons ({liveOpportunities.hackathons?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {liveOpportunities.jobs.map((job) => (
                    <Card key={job.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <Badge className="bg-blue-600">{job.platform}</Badge>
                        </div>
                        <CardDescription className="flex items-center space-x-4">
                          <span>{job.company}</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {job.salary && (
                          <div className="flex items-center text-green-400 font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {job.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {job.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.tags.length - 4}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            Posted: {new Date(job.posted_date).toLocaleDateString()}
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open(job.apply_url, '_blank')}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {liveOpportunities.jobs.length === 0 && (
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardContent className="text-center py-8">
                      <p className="text-gray-400">No jobs available at the moment. Check back later!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="internships" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {liveOpportunities.internships.map((internship) => (
                    <Card key={internship.id} className="bg-gray-900/50 border-gray-700 hover:border-green-500 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{internship.title}</CardTitle>
                          <Badge className="bg-green-600">{internship.platform}</Badge>
                        </div>
                        <CardDescription className="flex items-center space-x-4">
                          <span>{internship.company}</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {internship.location}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {internship.salary && (
                          <div className="flex items-center text-green-400 font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {internship.salary}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {internship.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-gray-400 line-clamp-2">
                          {internship.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            Posted: {new Date(internship.posted_date).toLocaleDateString()}
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => window.open(internship.apply_url, '_blank')}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {liveOpportunities.internships.length === 0 && (
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardContent className="text-center py-8">
                      <p className="text-gray-400">No internships available at the moment. Check back later!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="hackathons" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {liveOpportunities.hackathons.map((hackathon) => (
                    <Card key={hackathon.id} className="bg-gray-900/50 border-gray-700 hover:border-purple-500 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{hackathon.title}</CardTitle>
                          <Badge className="bg-purple-600">{hackathon.platform}</Badge>
                        </div>
                        <CardDescription className="flex items-center space-x-4">
                          <span>{hackathon.company}</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {hackathon.location}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {hackathon.prize_money && (
                          <div className="flex items-center text-yellow-400 font-semibold">
                            <Trophy className="w-4 h-4 mr-1" />
                            Prize: {hackathon.prize_money}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {hackathon.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-gray-400 line-clamp-2">
                          {hackathon.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 block">
                              Posted: {new Date(hackathon.posted_date).toLocaleDateString()}
                            </span>
                            {hackathon.deadline && (
                              <span className="text-xs text-red-400 block">
                                Deadline: {new Date(hackathon.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => window.open(hackathon.apply_url, '_blank')}
                          >
                            Register
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {liveOpportunities.hackathons.length === 0 && (
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardContent className="text-center py-8">
                      <p className="text-gray-400">No hackathons available at the moment. Check back later!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  All Activity
                </CardTitle>
                <CardDescription>
                  Complete history of your learning journey and career actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <log.icon className={`w-6 h-6 ${log.color}`} />
                        <div className="flex-1">
                          <p className="font-medium">{log.title}</p>
                          <p className="text-sm text-gray-400">{log.description}</p>
                          <p className="text-xs text-gray-500">{log.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Learning Path Dialog */}
        <Dialog open={showAddPath} onOpenChange={setShowAddPath}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Learning Path</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a custom learning roadmap for your goals
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                <Input
                  value={newPathTitle}
                  onChange={(e) => setNewPathTitle(e.target.value)}
                  placeholder="e.g., Full-Stack Web Development"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                <Textarea
                  value={newPathDescription}
                  onChange={(e) => setNewPathDescription(e.target.value)}
                  placeholder="Describe what you'll learn in this path..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Difficulty</label>
                <Select value={newPathDifficulty} onValueChange={setNewPathDifficulty}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleAddLearningPath}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  Add Path
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddPath(false)}
                  className="border-gray-600 text-gray-300 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}