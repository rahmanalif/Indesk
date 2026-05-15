import { CheckCircle2, Stethoscope, UserCog, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from '../../hooks/landing/useInView';
import { useGetAvailablePlansQuery } from '../../redux/api/clientsApi';

/**
 * Represents a row in the tiered pricing table (e.g., "1-9 extra clinicians: £12/each")
 */
type TierRow = {
  label: string;
  value: string;
};

/**
 * The internal structure used to render a pricing card
 */
type PricingPlan = {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  currency: string;
  description: string;
  isPopular: boolean;
  featureItems: string[];
  includedCliniciansLabel: string;
  includedAdminUsersLabel: string;
  extraSummary: string;
  tierRows: TierRow[];
};

/**
 * Converts snake_case feature keys (e.g. "online_booking") to Title Case ("Online Booking")
 */
const formatFeatureLabel = (key: string) =>
  key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

/**
 * Formats numbers into currency string based on user's locale and the specified currency.
 */
const formatCurrency = (amount: number, currencyCode: string) => {
  const userLocale = navigator.language || 'en-GB';
  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    currency: currencyCode || 'GBP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
};


/**
 * The main Pricing section for the landing page.
 * It fetches live plans from the API and processes them for display.
 */
export function PricingSection() {
  // Hook for intersection observer animation
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: '0px' });
  
  // RTK Query hook to fetch available subscription plans
  const { data, isLoading, isError } = useGetAvailablePlansQuery();

  /**
   * Process API data into our internal PricingPlan format
   */
  const apiPlans: PricingPlan[] = ((data as any)?.data || data?.response?.data || [])
    .filter((plan: any) => plan.isActive !== false) // Only show active plans
    .map((plan: any) => {
      // Map the boolean feature flags to a list of strings
      const featureItems = Object.entries(plan.features || {})
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => formatFeatureLabel(key));

      // Construct clinicians inclusion label
      const includedCliniciansLabel =
        `${plan.clinicianLimit ?? 0} Clinician${plan.clinicianLimit === 1 ? '' : 's'}${(plan.clinicianLimit ?? 0) > 1 ? ' Included' : ''}`;

      // Construct admin users inclusion label
      const includedAdminUsersLabel =
        `${plan.adminUserLimit ?? 0} Admin User${plan.adminUserLimit === 1 ? '' : 's'}`;

      let extraSummary = 'Extra clinicians are not available on this plan.';
      const tierRows: TierRow[] = [];

      if (plan.extraSeatsConfig?.supported) {
        const clinicianConfig = plan.extraSeatsConfig.types.find((t: any) => t.type === 'clinician');
        if (clinicianConfig && clinicianConfig.tiers.length > 0) {
          if (clinicianConfig.tiers.length === 1 && clinicianConfig.tiers[0].upTo === null) {
            const price = clinicianConfig.tiers[0].pricePerSeat;
            const priceText = price === 0 ? 'Included' : `${formatCurrency(price, plan.currency)}/each`;
            extraSummary = `Additional clinicians: ${priceText}`;
          } else {
            extraSummary = 'Extra Clinician Tiers:';
            clinicianConfig.tiers.forEach((tier: any, index: number) => {
              const prevUpTo = index === 0 ? 0 : (clinicianConfig.tiers[index - 1].upTo || 0);
              const start = prevUpTo + 1;
              const end = tier.upTo;
              let label = '';
              if (end) {
                label = start === 1 ? `Up to ${end} extra clinicians:` : `${start}-${end} extra clinicians:`;
              } else {
                label = `${start}+ extra clinicians:`;
              }
              const value = tier.pricePerSeat === 0 ? 'Included' : `${formatCurrency(tier.pricePerSeat, plan.currency)}/each`;
              tierRows.push({
                label,
                value,
              });
            });
          }
        }
      }

      return {
        id: plan.id,
        name: plan.name,
        price: Number(plan.price) || 0,
        formattedPrice: formatCurrency(Number(plan.price) || 0, plan.currency),
        currency: plan.currency || 'GBP',
        description: plan.description || '',
        isPopular: Boolean(plan.isPopular),
        featureItems,
        includedCliniciansLabel,
        includedAdminUsersLabel,
        extraSummary,
        tierRows,
      };
    });

  const plans = apiPlans;

  return (
    <section id="pricing" className="bg-[#faf9f6] px-4 py-12 sm:px-5 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Header Section */}
        <div className="mx-auto mb-9 max-w-[900px] text-center lg:mb-10">
          <h2 className="m-0 font-serif text-[34px] font-bold leading-[1.12] tracking-normal text-[#151817] sm:text-[42px] lg:text-[52px]">
            Transparent pricing for <br />
            <span className="text-[#4f6b3b]">every stage of your practice.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[720px] text-[16px] leading-[1.5] text-[#4d514b] lg:text-[18px]">
            Simple, predictable pricing. No hidden fees or surprise charges. Designed for clinicians, by clinicians.
          </p>
          {isLoading && <p className="mt-4 text-sm text-[#4d514b]">Loading plans...</p>}
          {isError && <p className="mt-4 text-sm text-[#4d514b]">Unable to load plans. Please try again later.</p>}
        </div>

        {/* Pricing Cards Grid */}
        <div ref={ref} className="mx-auto grid max-w-[560px] grid-cols-1 items-stretch gap-7 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => {
            const isPopularPlan = plan.isPopular;

            return (
              <article
                key={plan.id}
                className={`group relative flex h-full min-h-0 flex-col rounded-[14px] border border-[#c9cfbf] bg-white px-6 pb-7 pt-8 transition-[opacity,transform,box-shadow,border-color] duration-500 hover:z-10 hover:scale-[1.025] hover:border-[#54733c] hover:shadow-[0_28px_54px_rgba(75,94,57,0.11)] sm:px-8 lg:px-8 lg:pb-8 lg:pt-9 ${
                  isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                {/* Popular Badge */}
                <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#54733c] px-[18px] py-1.5 text-[11px] font-medium uppercase leading-none tracking-[0.04em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {isPopularPlan ? 'Most Popular' : 'Selected Plan'}
                </div>

                {/* Plan Name & Description */}
                <div>
                  <h3 className="m-0 font-serif text-[32px] font-semibold leading-[1.12] tracking-normal text-[#171918] lg:text-[34px]">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.45] text-[#555a52]">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing Display */}
                <div className="mb-7 mt-7 flex flex-col items-start">
                  <div className="flex items-end">
                    <span className="font-serif text-[50px] font-medium leading-[0.95] tracking-normal text-[#151817] lg:text-[54px]">
                      {plan.formattedPrice}
                    </span>
                    <small className="mb-[7px] ml-2 text-[15px] leading-none text-[#3e433e]">/mo</small>
                  </div>
                  <small className="mt-2 text-[13px] text-[#71766d]">
                    All charges billed in {plan.currency}
                  </small>
                </div>

                {/* Call to Action */}
                <Link
                  to={`/login?mode=signup&planId=${encodeURIComponent(plan.id)}&focus=plan`}
                  className="relative block w-full overflow-hidden rounded-lg border border-[#54733c] bg-white px-[18px] py-3 text-center text-[15px] font-semibold leading-tight text-[#4f6b3b] transition-all duration-300 before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:-skew-x-12 before:bg-white/30 before:opacity-0 before:transition-all before:duration-500 hover:-translate-y-0.5 hover:bg-[#486632] hover:text-white hover:shadow-[0_12px_24px_rgba(84,115,60,0.24)] hover:before:left-[115%] hover:before:opacity-100 group-hover:bg-[#54733c] group-hover:text-white"
                >
                  <span className="relative z-10">Choose Plan</span>
                </Link>

                {/* Seat Policies (Clinicians & Admins) */}
                <div className="mt-6 rounded-lg border border-transparent bg-[#f3f3f0] px-5 py-4 transition-colors duration-300 group-hover:border-[#c5ccb5] group-hover:bg-[#e0e6d2]">
                  <div className="flex items-center gap-[9px] text-[16px] leading-[1.35] text-[#171918] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:text-[#54733c]">
                    {isPopularPlan ? (
                      <Users aria-hidden="true" />
                    ) : (
                      <Stethoscope aria-hidden="true" />
                    )}
                    <strong>{plan.includedCliniciansLabel}</strong>
                  </div>

                  <div className="mt-2 flex items-center gap-[9px] text-[15px] leading-[1.35] text-[#555a52] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:text-[#71766d]">
                    <UserCog aria-hidden="true" />
                    <span>{plan.includedAdminUsersLabel}</span>
                  </div>

                  {/* Tiered Cost Information */}
                  {plan.tierRows.length > 0 ? (
                    <div className="mt-4 border-t border-[#cbd0c1] pt-4">
                      <p className="mb-2 text-[15px] leading-[1.45] text-[#454a43]">{plan.extraSummary}</p>
                      <div >
                        {plan.tierRows.map((tier) => (
                          <div
                            key={`${plan.id}-${tier.label}`}
                            className="flex justify-between gap-[18px] text-[14px] leading-[1.55] text-[#4b5148]"
                          >
                            <span>{tier.label}</span>
                            <strong className="flex-none font-medium text-[#171918]">{tier.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mb-0 mt-4 border-t border-[#cbd0c1] pt-4 text-[14px] leading-[1.45] text-[#454a43]">
                      {plan.extraSummary}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="pt-7">
                  <p className="mb-4 text-[16px] font-semibold leading-[1.35] text-[#151817]">Included Features</p>
                  <ul className="grid gap-x-5 gap-y-2 lg:grid-cols-2">
                    {plan.featureItems.map((feature) => (
                      <li key={`${plan.id}-${feature}`} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-[#454a43]">
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 flex-none fill-[#54733c] text-[#54733c] stroke-white [stroke-width:3]"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
