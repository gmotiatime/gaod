import { useState } from 'react';
import { motion } from 'framer-motion';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span className="text-orange-600 font-mono text-sm tracking-widest mb-4 block uppercase">
            Pricing
          </span>
          <h2 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] leading-tight">
            Start free
            <br />
            Upgrade to scale
          </h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
            Billing Cycle
          </span>
          <div className="bg-white border border-gray-200 p-1 rounded-full flex relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              YEARLY
            </button>
            {/* Animated Background for Toggle */}
            <motion.div
              className="absolute top-1 bottom-1 bg-[#1A1A1A] rounded-full"
              initial={false}
              animate={{
                x: billingCycle === 'monthly' ? 0 : '100%',
                width: '50%', // Assuming roughly equal width buttons
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ left: 4 }} // slight offset for padding
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300">
          <div className="mb-8">
            <div className="w-10 h-10 mb-6 border-2 border-gray-900 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            </div>
            <h3 className="text-xl font-medium mb-2">Free</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              For individuals to make sense of calls, documents, and surveys
            </p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-serif">$0</span>
          </div>
          <button className="w-full py-3 border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 hover:bg-gray-50 transition-colors mb-10">
            Try Gaod free
          </button>

          <div className="mt-auto">
            <p className="text-xs font-mono uppercase text-gray-400 mb-4 tracking-wider">
              What&apos;s included
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="border-b border-gray-300 border-dashed pb-0.5">
                  One channel
                </span>{' '}
                to automatically classify your voice of customer data
              </li>
              <li className="flex items-start gap-2">
                <span className="border-b border-gray-300 border-dashed pb-0.5">
                  One project
                </span>{' '}
                to analyze customer calls, recordings, docs, and surveys
              </li>
              <li className="flex items-start gap-2">
                Chat with and summarize your data to uncover trends and run
                analysis
              </li>
            </ul>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 border border-gray-900 flex flex-col shadow-xl relative overflow-hidden">
          <div className="mb-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center">
                <div className="w-10 h-[1px] bg-white/20 absolute"></div>
                <div className="h-10 w-[1px] bg-white/20 absolute"></div>
                {/* Globe icon simplified */}
                <div className="w-6 h-6 rounded-full border border-white/40"></div>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                SAVE 25%
              </span>
            </div>
            <h3 className="text-xl font-medium mb-2">Professional</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              For small teams to collaborate with advanced AI features
            </p>
          </div>
          <div className="mb-8 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif">
                ${billingCycle === 'yearly' ? '12' : '15'}
              </span>
              <span className="text-[10px] font-mono uppercase text-gray-500">
                Per user/month
                <br />
                {billingCycle === 'yearly' ? 'billed yearly' : 'billed monthly'}
              </span>
            </div>
          </div>
          <button className="w-full py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors mb-10 relative z-10">
            Start free 7 day trial
          </button>

          <div className="mt-auto relative z-10">
            <p className="text-xs font-mono uppercase text-gray-500 mb-4 tracking-wider">
              Everything in Free, plus
            </p>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="border-b border-gray-600 border-dashed pb-0.5">
                  Unlimited channels
                </span>{' '}
                (paid add-on) to automatically classify your voice of customer
                data
              </li>
              <li className="flex items-start gap-2">
                <span className="border-b border-gray-600 border-dashed pb-0.5">
                  Unlimited projects
                </span>{' '}
                to analyze customer calls, layouts, views, filters
              </li>
              <li className="flex items-start gap-2">
                Advanced analysis features like charts, layouts, views, filters
              </li>
              <li className="flex items-start gap-2">
                Advanced AI features like specific summaries and semantic search
              </li>
            </ul>
          </div>

          {/* Subtle grid background for pro card */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          ></div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300">
          <div className="mb-8">
            <div className="w-10 h-10 mb-6 border-2 border-gray-900 transform rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 border border-gray-900"></div>
            </div>
            <h3 className="text-xl font-medium mb-2">Enterprise</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              For organizations scaling and standardizing across teams
            </p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-serif">Custom</span>
          </div>
          <button className="w-full py-3 border border-gray-200 rounded-full text-sm font-medium hover:border-gray-900 hover:bg-gray-50 transition-colors mb-10">
            Contact sales
          </button>

          <div className="mt-auto">
            <p className="text-xs font-mono uppercase text-gray-400 mb-4 tracking-wider">
              Everything in Professional, plus
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                Unlimited free viewers and{' '}
                <span className="border-b border-gray-300 border-dashed pb-0.5">
                  unlimited AI chat
                </span>{' '}
                in Slack and Teams
              </li>
              <li className="flex items-start gap-2">
                Organization features like folders, global tags, fields,
                templates
              </li>
              <li className="flex items-start gap-2">
                Advanced AI features including{' '}
                <span className="border-b border-gray-300 border-dashed pb-0.5">
                  custom vocabulary
                </span>{' '}
                and translation
              </li>
              <li className="flex items-start gap-2">
                Secure with redaction, compliance, access control, and data
                retention
              </li>
              <li className="flex items-start gap-2">
                Priority support, dedicated customer success, onboarding
                assistance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
