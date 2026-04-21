import React from 'react';
import { SEO } from './SEO';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in duration-300">
      <SEO 
        title="Privacy Statement | MyFedPlan"
        description="Learn how MyFedPlan protects your privacy and handles your data."
      />
      <div className="bg-white rounded-xl shadow-sm border border-border p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl text-navy mb-4">MyFedPlan Privacy Statement</h1>
        <p className="italic text-text-3 mb-8">Updated April 2026</p>
        
        <div className="prose prose-blue max-w-none text-text-2 text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-bold text-text mt-8 mb-4">Our Commitment To Privacy</h2>
          <p>Your privacy is important to us. To better protect your privacy we provide this notice explaining our online information practices and the choices you can make about the way your information is collected and used. To make this notice easy to find, we make it available on our home page and at every point where personally identifiable information may be requested.</p>
          <p>This notice applies to all information collected from or submitted to the following MyFedPlan Web sites, but to make this notice easier to read we will use the term "our Web site", which means myfedplan.com, a MyFedPlan created private label website for a financial advisor, or fedbens.com.</p>
          <p>Our Web site contains links to other Web sites operated by third parties. MyFedPlan is not responsible for the privacy practices or policies of such third party web sites and this Notice does not apply to those Web sites.</p>
          
          <h2 className="text-lg font-bold text-text mt-8 mb-4">Application of This Notice</h2>
          <p>This Notice applies only to the information collected by MyFedPlan from the users of our Web site or a private label site created by MyFedPlan. It does not apply to information collected by MyFedPlan in any other way, including offline.</p>
          
          <h2 className="text-lg font-bold text-text mt-8 mb-4">The Information We Collect</h2>
          <p>Our Web site is not set up to automatically collect personally identifiable information from each visitor to our Web site. It does recognize the home server of visitors, but not email addresses. For example, we can tell which Internet Service Provider our visitors use, but not the names, addresses or other information about our visitors that would allow us to identify the particular visitors to our Web site. This information is used only for internal purposes by our technical support staff.</p>
          <p>Our Web site does track certain information about the visits to our Web site. For example, we compile statistics that show the numbers and frequency of visitors to our Web site and its individual pages. These aggregated statistics are used internally to improve our Web site and for product development and marketing purposes generally. Those aggregated statistics may also be provided to advertisers and other third parties, but again, the statistics contain no personal information and cannot be used to gather such information.</p>
          <p>In a few areas on our Web site, we ask you to provide information that will enable us to verify whether you are entitled to access and use certain information, materials and services available from our Web site, or to enable us to enhance your site visit, to assist you with customer service or technical support issues, or to follow up with you after your visit, or to otherwise support your customer relationship with MyFedPlan. It is completely optional for you to participate. However, failure to participate may mean that you cannot access and use certain information, materials and services.</p>
          
          <p>For example, we request information from you when you:</p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Log on to certain areas of our Web site, such as the myfedplan.com® Federal Benefit Annuity Calculator, where you may be prompted to provide us with your login ID (usually your email address) and password as a condition to gaining access to certain information, materials or services</li>
            <li>Register or sign up to use a service such as myfedplan.com</li>
            <li>Subscribe to a newsletter or desire to be added to our mailing lists for other products or services</li>
            <li>Place an order</li>
            <li>Participate in a sweepstakes or other promotional offer</li>
            <li>Provide feedback in an online survey.</li>
          </ul>
          
          <p>In each of the instances above, we typically ask for your name, email address, phone number, address, Login and password, as well as other similar personal information that is needed to register or subscribe you to services or offers. On occasion, we may ask for additional information to enable us to provide you with access to and use of certain information, materials and services. In the case of newsletters or mailing lists, you will be able to "unsubscribe" to these mailings at any time.</p>
          
          <h2 className="text-lg font-bold text-text mt-8 mb-4">How We Use Information: MyFedPlan Only Uses Your Personal Information for Specific Purposes</h2>
          <p>The personal information you provide to us when using our Web site, such as your name, postal or email address or telephone number will be kept confidential and used to support your customer relationship with MyFedPlan, and to notify you of special offers, updated information and new products and services from MyFedPlan, offers from third parties that we think may be of interest to you, or used by MyFedPlan or third parties for the purpose of conducting market research or surveys. Agents or contractors of MyFedPlan who are given access to your personal information will be required to keep the information confidential and not use it for any other purpose than to carry out the services they are performing per their contract with MyFedPlan.</p>
          <p>MyFedPlan may enhance or merge your information collected at its Web site with data from third parties for purposes of marketing products or services to you directly or via a third party.</p>
          <p>With respect to network advertising companies (companies that manage and provide advertising for numerous unrelated companies), to the extent that MyFedPlan utilizes such advertising companies to provide advertisements on our Web site, MyFedPlan may provide them with your log-in name and any demographic information about you that we collect. Those advertising companies may combine that data with non-personally identifiable data collected by the advertising company from your computer solely for the purpose of delivering on our Web site advertisements that are targeted to you.</p>
          
        </div>
      </div>
    </div>
  );
}
