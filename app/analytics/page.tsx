"use client"

import { Navbar } from "@/components/navbar"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const monthlyData = [
  { month: "Jan", offers: 2, applications: 1 },
  { month: "Feb", offers: 3, applications: 2 },
  { month: "Mar", offers: 4, applications: 3 },
  { month: "Apr", offers: 4, applications: 2 },
  { month: "May", offers: 5, applications: 4 },
  { month: "Jun", offers: 4, applications: 3 },
]

const rateData = [
  { rate: "3.5%", count: 1 },
  { rate: "4.0%", count: 2 },
  { rate: "4.5%", count: 3 },
  { rate: "5.0%", count: 2 },
  { rate: "5.5%", count: 1 },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your financial journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="gh-card p-6">
            <p className="text-sm text-muted-foreground">Total Offers</p>
            <p className="text-3xl font-bold text-foreground mt-2">23</p>
            <p className="text-xs text-muted-foreground mt-2">+2 this month</p>
          </div>
          <div className="gh-card p-6">
            <p className="text-sm text-muted-foreground">Applications</p>
            <p className="text-3xl font-bold text-foreground mt-2">15</p>
            <p className="text-xs text-muted-foreground mt-2">+3 this month</p>
          </div>
          <div className="gh-card p-6">
            <p className="text-sm text-muted-foreground">Avg Interest Rate</p>
            <p className="text-3xl font-bold text-foreground mt-2">4.7%</p>
            <p className="text-xs text-muted-foreground mt-2">-0.2% vs last month</p>
          </div>
          <div className="gh-card p-6">
            <p className="text-sm text-muted-foreground">Potential Savings</p>
            <p className="text-3xl font-bold text-foreground mt-2">$2,450</p>
            <p className="text-xs text-muted-foreground mt-2">vs market average</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="gh-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Offers & Applications</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="offers" stroke="var(--color-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="applications" stroke="var(--color-muted-foreground)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="gh-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Interest Rate Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="rate" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}
