import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName = "Alex" }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}</h1>
        <p className="text-muted-foreground mt-1">Here are your personalized loan offers</p>
      </div>
    </div>
  )
}
