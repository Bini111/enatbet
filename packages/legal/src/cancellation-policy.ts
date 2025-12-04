export const cancellationPolicy = {
  lastUpdated: "November 21, 2025",
  effectiveDate: "November 21, 2025",
  version: "1.0",
  
  title: "Cancellation Policy",
  
  sections: [
    {
      id: "overview",
      title: "1. Cancellation Policy Overview",
      content: `Enatbet offers three cancellation policies that hosts can choose for their listings. Each policy balances flexibility for guests with protection for hosts.

Hosts select one policy per listing. Guests see the cancellation policy before booking and agree to it when confirming their reservation.

All cancellation times are based on the local time of the property.`
    },
    {
      id: "flexible",
      title: "2. Flexible Policy",
      content: `Best for: Hosts who want maximum bookings and can handle last-minute cancellations.

Cancellation Terms:

24+ Hours Before Check-In:
• Full refund of accommodation fees
• Service fees refunded
• Guest receives 100% back

Within 24 Hours of Check-In:
• 50% refund of accommodation fees
• No service fee refund
• Cleaning fee not refunded
• Guest receives approximately 45-48% back

After Check-In:
• No refund of any fees
• Guest receives 0% back

Host Payout:
• If cancelled 24+ hours before: Host receives nothing
• If cancelled within 24 hours: Host receives 50% of accommodation fee
• No cancellation: Host receives full payment 24 hours after check-in

Example:
$200/night for 3 nights + $30 cleaning + $50 service fee = $680 total

Cancelled 48 hours before:
• Guest refund: $680 (100%)
• Host payout: $0

Cancelled 12 hours before:
• Guest refund: $350 (51%)
• Host payout: $300 (3 nights × $200 × 50%)

Ideal For:
• Hosts with high demand properties
• Properties in urban areas
• Hosts who can fill last-minute cancellations
• Part-time hosts`
    },
    {
      id: "moderate",
      title: "3. Moderate Policy",
      content: `Best for: Balanced protection for both guests and hosts.

Cancellation Terms:

5+ Days Before Check-In:
• Full refund of accommodation fees
• Service fees refunded
• Guest receives 100% back

2-5 Days Before Check-In:
• 50% refund of accommodation fees
• No service fee refund
• Cleaning fee not refunded
• Guest receives approximately 45-48% back

Within 2 Days of Check-In:
• No refund of any fees
• Guest receives 0% back

After Check-In:
• No refund of any fees
• Guest receives 0% back

Host Payout:

Cancelled 5+ days before:
• Host receives nothing

Cancelled 2-5 days before:
• Host receives 50% of accommodation fee

Cancelled within 2 days:
• Host receives full payment

Example:
$150/night for 5 nights + $50 cleaning + $75 service fee = $875 total

Cancelled 7 days before:
• Guest refund: $875 (100%)
• Host payout: $0

Cancelled 3 days before:
• Guest refund: $425 (49%)
• Host payout: $375 (5 nights × $150 × 50%)

Cancelled 1 day before:
• Guest refund: $0
• Host payout: $800 (full accommodation + cleaning)

Ideal For:
• Most hosts
• Vacation rentals
• Properties requiring planning
• Mid-range properties`
    },
    {
      id: "strict",
      title: "4. Strict Policy",
      content: `Best for: Hosts who need advance notice and maximum protection.

Cancellation Terms:

14+ Days Before Check-In:
• Full refund of accommodation fees
• Service fees refunded
• Guest receives 100% back

7-14 Days Before Check-In:
• 50% refund of accommodation fees
• No service fee refund
• Cleaning fee not refunded
• Guest receives approximately 45-48% back

Within 7 Days of Check-In:
• No refund of any fees
• Guest receives 0% back

After Check-In:
• No refund of any fees
• Guest receives 0% back

Host Payout:

Cancelled 14+ days before:
• Host receives nothing

Cancelled 7-14 days before:
• Host receives 50% of accommodation fee

Cancelled within 7 days:
• Host receives full payment

Example:
$300/night for 7 nights + $100 cleaning + $150 service fee = $2,350 total

Cancelled 20 days before:
• Guest refund: $2,350 (100%)
• Host payout: $0

Cancelled 10 days before:
• Guest refund: $1,125 (48%)
• Host payout: $1,050 (7 nights × $300 × 50%)

Cancelled 4 days before:
• Guest refund: $0
• Host payout: $2,200 (full accommodation + cleaning)

Ideal For:
• High-end properties
• Remote locations
• Properties requiring extensive preparation
• Full-time hosts
• Peak season bookings`
    },
    {
      id: "long-term",
      title: "5. Long-Term Cancellation (28+ Days)",
      content: `For bookings of 28 days or longer, special cancellation terms apply:

First Month:
• Guest can cancel with 30 days notice
• First month is non-refundable after booking
• Subsequent months refundable with 30 days notice

During Stay:
• Guest can end reservation with 30 days notice
• No refund for current month
• Refund for subsequent months not yet started

Host Cancellation:
• Host cannot cancel long-term bookings except for:
  - Property sale
  - Major repairs required by law
  - Personal emergency

Example:
3-month booking at $2,000/month

Guest cancels after 1 week:
• Month 1: No refund ($2,000 paid, not refunded)
• Months 2-3: Full refund ($4,000 refunded)

Guest cancels after 6 weeks (during month 2):
• Month 1: Already completed, no refund needed
• Month 2: No refund (currently using)
• Month 3: Full refund ($2,000 refunded)`
    },
    {
      id: "extenuating",
      title: "6. Extenuating Circumstances",
      content: `Enatbet may provide full refunds outside normal cancellation policies for:

Covered Circumstances:
• Death of guest or immediate family
• Serious illness requiring hospitalization
• Injury preventing travel
• Government-issued travel restrictions
• Natural disasters (hurricanes, earthquakes, floods)
• Declared emergencies at destination
• Jury duty or military deployment

Documentation Required:
• Medical records or death certificate
• Government advisories or orders
• Official court or military orders
• News articles for natural disasters

Not Covered:
• Weather (unless declared emergency)
• Flight cancellations (unless widespread travel restrictions)
• Work obligations
• Minor illness
• Personal emergencies (non-medical)
• Financial hardship

Process:
1. Guest submits claim within 14 days of discovery
2. Provide documentation
3. Enatbet reviews within 5-10 business days
4. Decision is final
5. Refund processed if approved

Host Compensation:
• Hosts are not penalized for approved extenuating circumstance cancellations
• Cancellations don't count against host metrics
• Calendar is automatically unblocked
• No cancellation fees applied`
    },
    {
      id: "host-cancellation",
      title: "7. Host Cancellation Policy",
      content: `Host cancellations damage guest trust and are strongly discouraged.

Penalties for Host Cancellations:

First Cancellation (within 1 year):
• $50 cancellation fee
• Calendar blocked for cancelled dates
• Automated review posted to listing
• Notification sent to affected guest

Second Cancellation:
• $100 cancellation fee
• Calendar blocked for 7 days after cancelled dates
• Warning notice on listing
• Reduced search ranking

Third Cancellation:
• $200 cancellation fee
• Account review
• Possible suspension
• Superhost status removed (if applicable)

Guest Compensation:
• Enatbet may compensate guests directly
• Help guests find alternative accommodation
• Cover price difference if applicable

Allowed Host Cancellations:
• Extenuating circumstances (with documentation)
• Property emergencies (flooding, fire, etc.)
• Safety concerns (with police report)
• Double bookings (not host's fault)

These are reviewed case-by-case and may not incur penalties.`
    },
    {
      id: "modifications",
      title: "8. Reservation Modifications",
      content: `Changing Dates:
• Guests can request date changes through platform
• Subject to property availability
• May be treated as cancellation + new booking
• New pricing may apply
• Host must approve changes

Shortening Stay:
• Treated as cancellation for unused nights
• Cancellation policy applies to shortened portion
• No refund if policy doesn't allow

Extending Stay:
• Subject to property availability
• Current rate applies (may differ from original)
• Requires host approval
• Separate reservation may be created

Adding Guests:
• Must not exceed property capacity
• Additional guest fees may apply
• Requires host approval
• Update reservation details

Process:
1. Guest requests modification
2. System calculates any price changes
3. Host approves or denies
4. Guest accepts new terms and pricing
5. Reservation updated`
    },
    {
      id: "refund-processing",
      title: "9. Refund Processing",
      content: `Timeline:
• Refunds processed within 5-10 business days
• Original payment method receives refund
• Credit cards: 3-5 business days
• Bank transfers: 5-10 business days
• PayPal: 3-5 business days

What Gets Refunded:
• Accommodation fees (per policy)
• Service fees (if eligible)
• Taxes (if accommodation refunded)

What's Not Refunded:
• Cleaning fees (unless full refund)
• Experience or add-on fees
• Service fees (for late cancellations)

Partial Refunds:
• Calculated automatically
• Based on cancellation policy
• Displayed before cancellation confirmed
• No negotiation after cancellation

Communication:
• Email confirmation sent immediately
• Refund details included
• Expected timeline provided
• Can track in account dashboard`
    },
    {
      id: "disputes",
      title: "10. Cancellation Disputes",
      content: `Guest Disputes:
• Guest disagrees with refund amount
• Property significantly different from listing
• Host not responding to messages
• Safety or cleanliness issues

Process:
1. Contact support within 24 hours
2. Provide evidence (photos, messages)
3. Support reviews situation
4. Decision made within 48-72 hours
5. Additional compensation if warranted

Host Disputes:
• Guest violated house rules
• Property damage occurred
• Complaint about refund to guest

Process:
1. Document violation or damage
2. Contact support with evidence
3. File damage claim if applicable
4. Review and decision

Appeals:
• Can appeal decision within 14 days
• Provide new evidence
• Final decision by senior support
• No further appeals`
    },
    {
      id: "choosing-policy",
      title: "11. Choosing the Right Policy",
      content: `Consider These Factors:

Your Property:
• High-demand = can use Flexible
• Unique/remote = consider Strict
• Mid-range = Moderate works well

Your Situation:
• Full-time host = may prefer Strict
• Part-time = Flexible might work
• Depend on income = Strict protects you

Market Conditions:
• Competitive market = Flexible helps booking rate
• Limited supply = can be Strict
• Seasonal = adjust per season

Guest Types:
• Business travelers = prefer Flexible
• Vacation groups = Moderate is fair
• Long-term = Custom policy

Testing:
• Start with Moderate
• Adjust based on cancellation rate
• Monitor booking rate
• Balance income with flexibility

Best Practices:
• Clearly display policy in listing
• Explain in welcome message
• Be understanding of extenuating circumstances
• Keep communication professional
• Document everything`
    },
    {
      id: "policy-changes",
      title: "12. Changing Your Policy",
      content: `How to Change:
• Update in listing settings
• Takes effect immediately for new bookings
• Existing bookings use original policy

Impact:
• More flexible = May increase bookings
• More strict = Better protection
• Consider seasonal changes
• Test for 30-60 days

Existing Reservations:
• Locked to policy at time of booking
• Cannot be changed retroactively
• Grandfathered under old policy
• Changes only affect future bookings

Best Time to Change:
• Low season: Test Flexible
• High season: Consider Strict
• After bad experience: Adjust accordingly
• Based on competition: Match market`
    }
  ],
  
  summary: `Choose the cancellation policy that works best for your property and situation. You can change it anytime, but existing bookings remain under their original policy. Clear communication and fair enforcement build trust with guests.`
};

export type CancellationSection = {
  id: string;
  title: string;
  content: string;
};

export type CancellationPolicy = typeof cancellationPolicy;
