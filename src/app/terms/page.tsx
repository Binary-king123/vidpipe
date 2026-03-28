export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and Conditions of Use',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>Last updated: {new Date().getFullYear()}</p>
        
        <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Age Requirement</h2>
        <p>You must be at least 18 years of age (or the age of majority in your jurisdiction) to use this website. By using this website, you represent and warrant that you are of legal age to form a binding contract and meet all of the foregoing eligibility requirements.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Content and Usage</h2>
        <p>This website contains adult-oriented material. All models shown on this website were 18 years of age or older at the time of photography/filming. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Disclaimer of Warranties</h2>
        <p>The site and all information, content, materials, and services included on or otherwise made available to you through this site are provided on an "as is" and "as available" basis, unless otherwise specified in writing.</p>
      </div>
    </div>
  )
}
