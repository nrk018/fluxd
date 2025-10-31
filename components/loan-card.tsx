import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface LoanOffer {
  id: string
  amount: number
  rate: number
  term: number
  lender: string
  featured?: boolean
}

interface LoanCardProps {
  offer: LoanOffer
}

export function LoanCard({ offer }: LoanCardProps) {
  return (
    <div
      className={`glass-card p-6 space-y-4 transition-all hover:shadow-xl hover:shadow-primary/30 ${
        offer.featured ? "ring-2 ring-primary glow-blue" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{offer.lender}</p>
          <h3 className="text-2xl font-bold text-foreground">${offer.amount.toLocaleString()}</h3>
        </div>
        {offer.featured && (
          <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">Featured</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Interest Rate</p>
          <p className="text-lg font-semibold text-foreground">{offer.rate}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Term</p>
          <p className="text-lg font-semibold text-foreground">{offer.term} months</p>
        </div>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group">
        View Details
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
