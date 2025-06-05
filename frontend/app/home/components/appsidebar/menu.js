import {
  Brain,
  PenTool,
  MessageSquare,
  Home,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Award,
} from "lucide-react"
const navigationData = {
  user: {
    name: "John Doe",
    email: "alex.chen@stude",
    avatar: "/placeholder.svg?height=32&width=32",
    grade: "CSE",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Classes",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Matrix & Calcus",
          url: "#",
          badge: "A-",
          color: "bg-blue-500",
        },
        {
          title: "Data Structrue And Algorithms",
          url: "#",
          badge: "B+",
          color: "bg-green-500",
        },
        {
          title: "problem solving by C++",
          url: "#",
          badge: "A",
          color: "bg-purple-500",
        },
        {
          title: "Web Technology",
          url: "#",
          badge: "B",
          color: "bg-orange-500",
        },
        {
          title: "Operating System",
          url: "#",
          badge: "A-",
          color: "bg-red-500",
        },
        {
          title: "Computer Network",
          url: "#",
          badge: "B+",
          color: "bg-teal-500",
        },
      ],
    },
    {
      title: "Assignments",
      url: "#",
      icon: PenTool,
      badge: "3 due",
      items: [
        {
          title: "Pending",
          url: "#",
          badge: "3",
        },
        {
          title: "Submitted",
          url: "#",
        },
        {
          title: "Graded",
          url: "#",
        },
      ],
    },
    {
      title: "AI Tutor",
      url: "#",
      icon: Brain,
      items: [
        {
          title: "Study Sessions",
          url: "#",
        },
        {
          title: "Practice Tests",
          url: "#",
        },
        {
          title: "Concept Help",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      title: "Study Groups",
      url: "#",
      icon: Users,
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageSquare,
      badge: "2",
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Resources",
      url: "#",
      icon: FileText,
    },
    {
      title: "Achievements",
      url: "#",
      icon: Award,
    },
  ],
}
export default navigationData;