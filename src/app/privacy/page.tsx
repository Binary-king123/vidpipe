export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and Data Usage',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>Last updated: {new Date().getFullYear()}</p>
        
        <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes Personal Data such as IP addresses, browser information, and usage statistics to improve user experience.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to compile anonymous statistical data and analysis for use internally or with third parties.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Cookies and Tracking</h2>
        <p>We use cookies to help customize the Site and improve your experience. Specifically, we use cookies to track your age verification status so you do not have to confirm your age upon every visit. We may also use tracking to analyze traffic and site usage.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
      </div>
    </div>
  )
}
