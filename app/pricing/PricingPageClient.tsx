'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WrapperClient from '@/app/WrapperClient';

export default function PricingPageClient() {
  const router = useRouter();

  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: 'forever',
      badge: null,
      features: [
        'Test prompts with Gemini Flash',
        'Save up to 10 test runs',
        'Access to prompt library',
        'Community support',
      ],
      comingSoon: [],
      cta: 'Get Started',
      ctaAction: () => router.push('/tester'),
      ctaHref: null,
      popular: false,
    },
    {
      name: 'Pro',
      price: '£9.99',
      period: 'month',
      badge: "Founder's Price — Limited Time",
      features: [
        'Everything in Free',
        'Access GPT-4o (OpenAI)',
        'Access Claude 3.5 Sonnet',
        'Unlimited test runs',
        'Side-by-side multi-model comparisons',
        'Export results',
        'Priority support',
        'Early access to new features',
      ],
      comingSoon: [
        'API access',
        'Advanced analytics',
        'Team collaboration',
      ],
      cta: 'Coming Soon — Join Waitlist',
      ctaAction: null,
      ctaHref: '/waitlist',
      popular: true,
    },
    {
      name: 'Creator',
      price: '£49',
      period: 'month',
      badge: null,
      features: [
        'Everything in Pro',
        'API access',
        'White-label options',
        'Custom integrations',
        'Dedicated support',
        'Usage analytics',
        'Team management',
      ],
      comingSoon: [
        'Custom model training',
        'Enterprise SSO',
      ],
      cta: 'Coming Soon — Join Waitlist',
      ctaAction: null,
      ctaHref: '/waitlist',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Will GPT-4o and Claude be included?',
      answer: 'Yes! GPT-4o and Claude 3.5 Sonnet are included in the Pro plan. You can test your prompts across all three models simultaneously.',
    },
    {
      question: 'Can I cancel any time?',
      answer: 'Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your billing period.',
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. We take privacy seriously. Your prompts and test results are stored securely and never shared with third parties. You can delete your data at any time.',
    },
    {
      question: 'Will Pro pricing increase later?',
      answer: "Founder's Price subscribers will be grandfathered at £9.99/month. Future subscribers may see different pricing, but your rate is locked in.",
    },
  ];

  return (
    <WrapperClient>
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-10">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Choose the plan that works for you. Start free, upgrade when you need more power.
          </p>
        </header>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 border rounded-xl p-6 lg:p-8 flex flex-col ${
                plan.popular
                  ? 'border-2 border-indigo-500 dark:border-indigo-500 shadow-xl scale-105 lg:scale-110 relative z-10'
                  : 'border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <span className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  /{plan.period}
                </span>
              </div>

              {plan.badge && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.comingSoon && plan.comingSoon.length > 0 && (
                <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Coming Soon
                  </p>
                  <ul className="space-y-2">
                    {plan.comingSoon.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-500 dark:text-gray-400 text-sm"
                      >
                        <span className="text-gray-400 dark:text-gray-600 mr-2 mt-0.5">○</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.ctaHref ? (
                <Link
                  href={plan.ctaHref}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all block text-center ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={plan.ctaAction}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </WrapperClient>
  );
}

