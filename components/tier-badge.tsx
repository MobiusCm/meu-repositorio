import { Badge } from "@/components/ui/badge"

interface TierBadgeProps {
  tier: string
}

export function TierBadge({ tier }: TierBadgeProps) {
  if (tier === "gold") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
        Gold
      </Badge>
    )
  } else if (tier === "silver") {
    return (
      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
        Silver
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
        Bronze
      </Badge>
    )
  }
}
