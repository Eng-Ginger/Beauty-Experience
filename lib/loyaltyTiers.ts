export type LoyaltyTierKey = 'rose' | 'gold' | 'platinum'

export interface LoyaltyTier {
  name: string
  price: number
  amountFils: number
  label: string
  badge: string
  gradient: string
  discountPercent: number
  subtitle?: string
  perks: string[]
}

export const LOYALTY_TIERS: Record<LoyaltyTierKey, LoyaltyTier> = {
  rose: {
    name: 'Rose Member',
    price: 0,
    amountFils: 0,
    label: 'Free Membership',
    badge: '🌸',
    gradient: 'linear-gradient(135deg, #F5E6EA, #E8B4C0)',
    discountPercent: 5,
    perks: [
      'Free enrollment',
      '5% Birthday Discount',
      'Earn loyalty points on every visit',
      'Priority notification of promotions and special offers',
      'One complimentary scalp analysis and smart nail upon registration',
      'Exclusive member-only offers throughout the year',
      'Access to seasonal giveaways and beauty events',
    ],
  },
  gold: {
    name: 'Gold Member',
    // TEST PRICE — live Ziina payment testing. To revert: price 299, amountFils 29900, label 'AED 299 / Year'.
    price: 2,
    amountFils: 200,
    label: 'AED 2 / Year',
    badge: '✦',
    gradient: 'linear-gradient(135deg, #C9A882, #E8D5B8)',
    discountPercent: 15,
    subtitle: 'Designed for regular guests who love extra value.',
    perks: [
      '15% discount on all salon services',
      'Complimentary scalp analysis once per month',
      'One free Smart Nail design every month',
      'Complimentary blow-dry with any hair treatment service',
      'Early access to promotions and special offers',
    ],
  },
  platinum: {
    name: 'Platinum Member',
    price: 399,
    amountFils: 39900,
    label: 'AED 399 / Year',
    badge: '◆',
    gradient: 'linear-gradient(135deg, #9B8EA8, #C4B8D0)',
    discountPercent: 25,
    subtitle: 'Our premium VIP membership for the ultimate Beauty Experience.',
    perks: [
      '25% discount on all salon services',
      'Unlimited scalp analysis sessions',
      'One complimentary Head Spa treatment every 3 months',
      'Priority booking and VIP access',
      'Exclusive birthday gift',
      '15% discount on retail products',
      'One complimentary blow-dry every 2 months',
      'Early access to new services, promotions, and member-only offers',
    ],
  },
}
