"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { MessageCircle, TrendingUp, DollarSign } from "lucide-react"

const LOAN_OFFERS = [
  {
    id: "1",
    amount: 50000,
    rate: 4.5,
    term: 60,
    lender: "Prime Financial",
    featured: true,
  },
  {
    id: "2",
    amount: 50000,
    rate: 5.2,
    term: 48,
    lender: "Capital Bank",
  },
  {
    id: "3",
    amount: 50000,
    rate: 4.8,
    term: 72,
    lender: "Wealth Partners",
  },
  {
    id: "4",
    amount: 50000,
    rate: 5.5,
    term: 60,
    lender: "Trust Lending",
  },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Alex</h1>
          <p className="text-muted-foreground mt-2">Here's your financial overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gh-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold text-foreground mt-2">4</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/50" />
            </div>
          </div>
          <div className="gh-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Rate</p>
                <p className="text-2xl font-bold text-foreground mt-2">4.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/50" />
            </div>
          </div>
          <div className="gh-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly</p>
                <p className="text-2xl font-bold text-foreground mt-2">$833</p>
              </div>
              <MessageCircle className="w-8 h-8 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Loan Offers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Available Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOAN_OFFERS.map((offer) => (
              <div key={offer.id} className="gh-card p-4 hover:shadow-md transition-shadow">
                {offer.featured && (
                  <div className="mb-3 inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    Featured
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Lender</p>
                    <p className="font-semibold text-foreground">{offer.lender}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="font-semibold text-foreground">{offer.rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Term</p>
                      <p className="font-semibold text-foreground">{offer.term}mo</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="gh-card p-8 text-center space-y-4 border-2 border-primary/20">
          <h3 className="text-2xl font-bold text-foreground">Need personalized advice?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Talk to Fluxd, our AI financial advisor, to get personalized recommendations based on your unique situation.
          </p>
          <Link href="/chat">
            <Button size="lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Talk to Fluxd
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
