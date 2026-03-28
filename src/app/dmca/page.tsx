export const metadata = {
  title: 'DMCA Notice',
  description: 'Digital Millennium Copyright Act (DMCA) Policy',
}

export default function DmcaPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">DMCA Notice</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>This website respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, we will respond expeditiously to claims of copyright infringement committed using our service.</p>
        
        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Filing a DMCA Notice</h2>
        <p>If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the site by completing a DMCA Notice of Alleged Infringement.</p>

        <p>Upon receipt of Notice as described below, we will take whatever action, in our sole discretion, we deem appropriate, including removal of the challenged content from the site.</p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-4">Notice Requirements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Identify the copyrighted work that you claim has been infringed.</li>
          <li>Identify the material or link you claim is infringing and that access to which is to be disabled, including at a minimum the URL of the link shown on the Site.</li>
          <li>Provide your company affiliation (if applicable), mailing address, telephone number, and email address.</li>
          <li>Include both of the following statements in the body of the Notice:
            <ul className="list-circle pl-6 mt-2 space-y-2">
              <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law."</li>
              <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
            </ul>
          </li>
          <li>Provide your full legal name and your electronic or physical signature.</li>
        </ul>
      </div>
    </div>
  )
}
