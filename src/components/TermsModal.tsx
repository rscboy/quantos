import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export function TermsModal({ isOpen, onClose, initialTab = 'terms' }: Props) {
  const [activeTab, setActiveTab] = React.useState<'terms' | 'privacy'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-navy p-4 sm:p-6 text-white shrink-0 flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl">Legal Information</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-border shrink-0 bg-gray-50">
              <button
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'terms' ? 'text-blue border-b-2 border-blue bg-white' : 'text-text-2 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('terms')}
              >
                Terms and Conditions
              </button>
              <button
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'privacy' ? 'text-blue border-b-2 border-blue bg-white' : 'text-text-2 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('privacy')}
              >
                Privacy Statement
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 text-sm text-text-2 leading-relaxed space-y-4">
              {activeTab === 'terms' ? (
                <>
                  <h3 className="text-lg font-bold text-text mb-4">Terms and Conditions of Use</h3>
                  <p className="font-semibold">YOUR USE OF THIS WEB SITE CONSTITUTES YOUR AGREEMENT TO BE BOUND BY THESE TERMS AND CONDITIONS OF USE.</p>
                  <p>This Web site, including all of its features and content (the “Web Site”) is a service made available by Quantos Software LLC or its affiliates (“Provider”) and all content, information, services and software ordered or provided on or through this Web Site (“Content”) may be used solely under the following terms and conditions (“Terms of Use”).</p>
                  
                  <p><strong>1. Limitations on Use.</strong> The Content on this Web Site is for your personal use only and not for commercial exploitation. Notwithstanding the foregoing, to the extent this Web Site provides electronic commerce, such buying opportunities may be made available for group as well as personal purchasing, so long as you are authorized to make purchases on behalf of such group. You may not decompile, reverse engineer, disassemble, rent, lease, loan, sell, sublicense, or create derivative works from this Web Site or the Content. Nor may you use any network monitoring or discovery software to determine the site architecture, or extract information about usage, individual identities or users. You may not use any robot, spider, other automatic software or device, or manual process to monitor or copy our Web Site or the Content without Provider’s prior written permission. You may not copy, modify, reproduce, republish, distribute, display, or transmit for commercial, non-profit or public purposes all or any portion of this Web Site, except to the extent permitted above. You may not use or otherwise export or re-export this Web Site or any portion thereof, or the Content in violation of the export control laws and regulations of the United States of America. Any unauthorized use of this Web Site or its Content is prohibited.</p>
                  
                  <p><strong>2. Web Site Limited License.</strong> As a user of this Web Site you are granted a nonexclusive, nontransferable, revocable, limited license to access and use this Web Site and Content in accordance with these Terms of Use. Provider may terminate this license at any time for any reason.</p>
                  
                  <p><strong>3. Not Financial Advice.</strong> Content is not intended to and does not constitute financial advice nor is anything submitted to this Web Site treated as confidential. The accuracy, completeness, adequacy or currency of the Content is not warranted or guaranteed. Your use of Content on this Web Site or materials linked from this Web Site is at your own risk.</p>
                  
                  <p><strong>4. Linking to this Web Site.</strong> You may provide links only to the homepage of this Web Site, provided (a) you do not remove or obscure, by framing or otherwise, any portion of the homepage, including its advertisements, the terms of use, the copyright notice, or other notices on this Site, (b) you give Provider notice of such link by sending an e-mail to sales@quantos.com and (c) you discontinue providing links to this Web Site if requested by Provider. If you wish to provide links to a section within this Web Site, you should forward your request to Provider at sales@quantos.com and Provider will notify you if permission is granted, and if so the terms and conditions of the permission.</p>
                  
                  <p><strong>5. Intellectual Property Rights.</strong> Except as expressly provided in these Terms of Use, nothing contained herein shall be construed as conferring any license or right, by implication, estoppel or otherwise, under copyright or other intellectual property rights. You agree that the Content and Web Site are protected by copyrights, trademarks, service marks, patents or other proprietary rights and laws.</p>
                  
                  <p>Copyright law protects materials available in this Web site. Copyright © 2026 the Quantos Software LLC. All rights reserved.</p>
                  
                  <p>No part of the materials including graphics or logos, available in this Web site may be copied, photocopied, reproduced, translated or reduced to any electronic medium or machine-readable form, in whole or in part, without specific permission. Distribution for commercial purposes is prohibited.</p>
                  
                  <p><strong>6. No Solicitation.</strong> You shall not distribute on or through this Web Site any content or material containing any advertising, promotion, solicitation for goods, services or funds or solicitation for others to become members of any enterprise or organization without the express written permission of the Provider. Notwithstanding the foregoing, in any interactive areas of this Web Site, where appropriate you a) may list along with your name, address and email address, your own web site’s URL and b) may recommend third party Web sites, goods or services so long as you have no financial interest in and receive no direct or indirect benefit from such recommended Web site, product or service or its recommendation. In no event may any person or entity solicit anyone with data retrieved from this Web Site.</p>
                  
                  <p><strong>7. License of Your Content to Provider.</strong> By uploading content to or submitting any materials for use on this Web Site, you grant (or warrant that the owner of such rights has expressly granted) Provider a perpetual, worldwide, royalty-free, irrevocable, non-exclusive right and license, with right to sublicense, to use, reproduce, modify, adapt, publish, publicly perform, publicly display, digitally display and digitally perform, translate, create derivative works from and distribute such materials or incorporate such materials into any form, medium, or technology now known or later developed throughout the universe. You agree that you shall have no recourse against Provider for any alleged or actual infringement or misappropriation of any proprietary right in your communications to us.</p>
                  
                  <p><strong>8. Registration.</strong> Certain sections of this Web Site require you to register. If registration is requested, you agree to provide Provider with accurate and complete registration information. It is your responsibility to inform Provider of any changes to that information. Each registration is for a single individual only, unless specifically designated otherwise on the registration page. Provider does not permit a) anyone other than you to use the sections requiring registration by using your name or password; or b) access through a single name being made available to multiple users on a network or otherwise. You are responsible for preventing such unauthorized use. If you believe there has been unauthorized use, you must notify Provider immediately by emailing sales@quantos.com</p>
                  
                  <p><strong>9. Advertisers.</strong> This Web Site may contain advertising and sponsorship. Advertisers and sponsors are responsible for ensuring that material submitted for inclusion on this Web Site is accurate and complies with applicable laws. Provider will not be responsible for the illegality of or any error or inaccuracy in advertisers’ or sponsors’ materials or for the acts or omissions of advertisers and sponsors.</p>
                  
                  <p><strong>10. Postings in interactive areas of the Web Site.</strong></p>
                  <p><strong>10.1. Postings to be Lawful.</strong> If you participate in interactive areas on this Web Site, you shall not post, publish, upload or distribute any messages, data, information, text, graphics, links or other material (“Postings”) which is unlawful or abusive in any way, including but not limited to any Postings that are defamatory, libelous, pornographic, obscene, threatening, invasive of privacy or publicity rights, inclusive of hate speech, or would constitute or encourage a criminal offense, violate the rights of any party, or give rise to liability or violate any local, state, federal or international law, or the regulations of the U.S. Securities and Exchange Commission, any rules of any securities exchange such as the New York Stock Exchange, the American Stock Exchange, or the NASDAQ, either intentionally or unintentionally. Provider may delete your Posting at any time for any reason without permission from you.</p>
                  <p><strong>10.2. Postings to be in Your Name.</strong> Your Postings shall be accompanied by your real name and shall not be posted anonymously. Participants in interactive areas shall not misrepresent their identity or their affiliation with any person or entity.</p>
                  <p><strong>10.3. Non-Commercial Use only of Interactive Areas.</strong> Any interactive area of this Web Site is provided solely for your personal use. As a participant, you shall not include in your Posting(s) or otherwise distribute on or through this Web Site any content or material containing any advertising, promotion, solicitation for goods, services or funds or solicitation for anyone to become members of any commercial enterprise or organization without the express written permission of the Provider. Any unauthorized use of any interactive area of this Web Site, its Content or Postings is expressly prohibited.</p>
                  <p><strong>10.4. No Monitoring of Postings.</strong> Provider has no obligation nor does it intend to edit, monitor or screen Postings and is not responsible for the content in such Postings or any content linked to or from such Postings. Notwithstanding the foregoing Provider reserves the right to examine from time to time, some, all, or no interactive areas for adherence to the Terms of Use and to remove any materials that may be objectionable or violate the Terms of Use.</p>
                  
                  <p><strong>11. Errors and Corrections.</strong> Provider does not represent or warrant that this Web Site or the Content will be error-free, free of viruses or other harmful components, or that defects will be corrected or that it will always be accessible. Provider does not warrant or represent that the Content available on or through this Web Site will be correct, accurate, timely, or otherwise reliable. Provider may make improvements and/or changes to its features, functionality or Content at any time.</p>
                  
                  <p><strong>12. Financial Advisor Ethics Notice.</strong> If you are a financial advisor participating in any aspect of this Web Site, including but not limited to message boards, chat rooms or email forums, you acknowledge that the Rules of Professional Conduct of the States where you are licensed (“Rules”) apply to all aspects of your participation and that you will abide by these Rules. These Rules include, but are not limited to, the rules relating to advertising, solicitation of clients, unauthorized practice of law, and misrepresentations of fact. Provider disclaims all responsibility for your compliance with these Rules. You further agree and acknowledge that when you participate in any chat area on this Web Site, including but not limited to the message boards, that you will not offer financial advice, but will only provide general information.</p>
                  
                  <p><strong>13. Third Party Content.</strong> Third party content may appear on this Web Site or may be accessible via links from this Web Site. Provider shall not be responsible for and assumes no liability for any infringement, mistakes, misstatements of law, defamation, slander, libel, omissions, falsehood, obscenity, pornography or profanity in the statements, opinions, representations or any other form of content contained in any third party content appearing on this Web Site. You understand that the information and opinions in the third party content is neither endorsed by nor does it reflect the belief of Provider.</p>
                  
                  <p><strong>14. DISCLAIMER.</strong> THIS WEB SITE AND THE CONTENT ARE PROVIDED ON AN "AS IS, AS AVAILABLE" BASIS. PROVIDER EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. PROVIDER DISCLAIMS ALL RESPONSIBILITY FOR ANY LOSS, INJURY, CLAIM, LIABILITY, OR DAMAGE OF ANY KIND RESULTING FROM, ARISING OUT OF OR ANY WAY RELATED TO (A) ANY ERRORS IN OR OMISSIONS FROM THIS WEB SITE AND THE CONTENT, INCLUDING BUT NOT LIMITED TO TECHNICAL INACCURACIES AND TYPOGRAPHICAL ERRORS, (B) ANY THIRD PARTY WEB SITES OR CONTENT THEREIN DIRECTLY OR INDIRECTLY ACCESSED THROUGH LINKS IN THIS WEB SITE, INCLUDING BUT NOT LIMITED TO ANY ERRORS IN OR OMISSIONS THEREFROM, (C) THE UNAVAILABILITY OF THIS WEB SITE, THE CONTENT, OR ANY PORTION THEREOF, (D) YOUR USE OF THIS WEB SITE OR THE CONTENT, OR (E) YOUR USE OF ANY EQUIPMENT OR SOFTWARE IN CONNECTION WITH THIS WEB SITE OR THE CONTENT.</p>
                  
                  <p><strong>15. LIMITATION OF LIABILITY.</strong> PROVIDER SHALL NOT BE LIABLE FOR ANY LOSS, INJURY, CLAIM, LIABILITY, OR DAMAGE OF ANY KIND RESULTING FROM YOUR USE OF THIS WEB SITE, THE CONTENT, THE INTERACTIVE AREAS OF THIS WEB SITE OR ANY FACTS OR OPINIONS APPEARING ON OR THROUGH AN INTERACTIVE AREA. PROVIDER SHALL NOT BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, INCIDENTAL, PUNITIVE OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER (INCLUDING, WITHOUT LIMITATION, ATTORNEYS' FEES) IN ANY WAY DUE TO, RESULTING FROM, OR ARISING IN CONNECTION WITH THE USE OF OR INABILITY TO USE THIS WEB SITE OR THE CONTENT. TO THE EXTENT THE FOREGOING LIMITATION OF LIABILITY IS PROHIBITED OR FAILS OF ITS ESSENTIAL PURPOSE, PROVIDER’S SOLE OBLIGATION TO YOU FOR DAMAGES SHALL BE LIMITED TO $100.00.</p>
                  
                  <p><strong>16. Unlawful Activity.</strong> Provider reserves the right to investigate complaints or reported violations of our Terms of Use and to take any action we deem appropriate including but not limited to reporting any suspected unlawful activity to law enforcement officials, regulators, or other third parties and disclosing any information necessary or appropriate to such persons or entities relating to user profiles, e-mail addresses, usage history, posted materials, IP addresses and traffic information.</p>
                  
                  <p><strong>17. Indemnification.</strong> You agree to indemnify, defend and hold harmless Provider, its officers, directors, employees, agents, licensors, suppliers and any third party information providers to the Web Site from and against all claims, losses, expenses, damages and costs, including reasonable attorneys' fees, resulting from any violation of these Terms of Use by you</p>
                  
                  <p><strong>18. Third Party Rights.</strong> The provisions of paragraphs 14 (Disclaimer), 15 (Limitation of Liability), and 16 (Indemnification) are for the benefit of Provider and its officers, directors, employees, agents, licensors, suppliers, and any third party information providers to the Web Site. Each of these individuals or entities shall have the right to assert and enforce those provisions directly against you on its own behalf.</p>
                  
                  <p><strong>19. Privacy.</strong> Your use of this Web Site is subject to Provider’s Privacy Policy. Provider reserves the right to change the Privacy Policy at any time. Updated versions of the Privacy Policy will appear on this Web Site and are effective immediately. You are responsible for regularly reviewing the Privacy Policy. Continued us of this Web Site after any such changes constitutes your consent to such changes.</p>
                  
                  <p><strong>20. Severability of Provisions.</strong> These Terms of Use incorporate by reference any notices contained on this Web Site and the Privacy Policy constitute the entire agreement with respect to access to and use of this Web Site and the Content. If any provision of these Terms of Use is unlawful, void or unenforceable, or conflicts with other Services Terms then that provision shall be deemed severable from the remaining provisions and shall not affect their validity and enforceability. Notwithstanding anything to the contrary in these Terms of Use, if you have a separate signed written agreement with a Provider that applies to your use of any of that Provider's Content, that agreement constitutes the entire agreement between you and that Provider with respect to the affected Content subject thereto (the "Otherwise Covered Content"), and these Terms of Use shall be treated as having no force or effect with respect to the Otherwise Covered Content..</p>
                  
                  <p><strong>21. Remedies for Violations.</strong> Provider reserves the right to seek all remedies available at law and in equity for violations of these Terms of Use, including but not limited to the right to block access from a particular Internet address to this Web Site and any other Provider Web sites and their features.</p>
                  
                  <p><strong>22. Governing Law and Jurisdiction.</strong> The Terms of Use are governed by and construed in accordance with the laws of the State of Ohio and any action arising out of or relating to these terms shall be filed only in state or federal courts located in Ohio and you hereby consent and submit to the personal jurisdiction of such courts for the purpose of litigating any such action</p>
                  
                  <p><strong>23. Modifications to Terms of Use.</strong> Provider reserves the right to change these Terms of Use at any time. Updated versions of the Terms of Use will appear on this Web Site and are effective immediately. You are responsible for regularly reviewing the Terms of Use. Continued use of this Web Site after any such changes constitutes your consent to such changes.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-text mb-4">Quantos Software Privacy Statement</h3>
                  <p className="italic mb-6">Updated April 2026</p>
                  
                  <p><strong>Our Commitment To Privacy</strong><br />
                  Your privacy is important to us. To better protect your privacy we provide this notice explaining our online information practices and the choices you can make about the way your information is collected and used. To make this notice easy to find, we make it available on our home page and at every point where personally identifiable information may be requested.</p>
                  
                  <p>This notice applies to all information collected from or submitted to the following Quantos Software Web sites, but to make this notice easier to read we will use the term "our Web site", which means myfedplan.com, a Quantos Software LLC created private label website for a financial advisor, or fedbens.com.</p>
                  
                  <p>Our Web site contains links to other Web sites operated by third parties. Quantos is not responsible for the privacy practices or policies of such third party web sites and this Notice does not apply to those Web sites.</p>
                  
                  <p><strong>Application of This Notice</strong><br />
                  This Notice applies only to the information collected by Quantos Software from the users of our Web site or a private label site created by Quantos. It does not apply to information collected by Quantos in any other way, including offline.</p>
                  
                  <p><strong>The Information We Collect</strong><br />
                  Our Web site is not set up to automatically collect personally identifiable information from each visitor to our Web site. It does recognize the home server of visitors, but not email addresses. For example, we can tell which Internet Service Provider our visitors use, but not the names, addresses or other information about our visitors that would allow us to identify the particular visitors to our Web site. This information is used only for internal purposes by our technical support staff.</p>
                  
                  <p>Our Web site does track certain information about the visits to our Web site. For example, we compile statistics that show the numbers and frequency of visitors to our Web site and its individual pages. These aggregated statistics are used internally to improve our Web site and for product development and marketing purposes generally. Those aggregated statistics may also be provided to advertisers and other third parties, but again, the statistics contain no personal information and cannot be used to gather such information.</p>
                  
                  <p>In a few areas on our Web site, we ask you to provide information that will enable us to verify whether you are entitled to access and use certain information, materials and services available from our Web site, or to enable us to enhance your site visit, to assist you with customer service or technical support issues, or to follow up with you after your visit, or to otherwise support your customer relationship with Quantos. It is completely optional for you to participate. However, failure to participate may mean that you cannot access and use certain information, materials and services.</p>
                  
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
                  
                  <p><strong>How We Use Information: Quantos Only Uses Your Personal Information for Specific Purposes</strong><br />
                  The personal information you provide to us when using our Web site, such as your name, postal or email address or telephone number will be kept confidential and used to support your customer relationship with Quantos, and to notify you of special offers, updated information and new products and services from Quantos, offers from third parties that we think may be of interest to you, or used by Quantos or third parties for the purpose of conducting market research or surveys. Agents or contractors of Quantos who are given access to your personal information will be required to keep the information confidential and not use it for any other purpose than to carry out the services they are performing per their contract with Quantos.</p>
                  
                  <p>Quantos may enhance or merge your information collected at its Web site with data from third parties for purposes of marketing products or services to you directly or via a third party.</p>
                  
                  <p>With respect to network advertising companies (companies that manage and provide advertising for numerous unrelated companies), to the extent that Quantos utilizes such advertising companies to provide advertisements on our Web site, Quantos may provide them with your log-in name and any demographic information about you that we collect. Those advertising companies may combine that data with non-personally identifiable data collected by the advertising company from your computer solely for the purpose of delivering on our Web site advertisements that are targeted to you.</p>
                  
                  <p>Circumstances may arise where we are required to disclose your personal information to third parties for purposes other than to support your customer relationship with Quantos, such as in connection with a corporate divestiture or dissolution where we sell all or a portion of our business or assets (including our associated customer lists containing your personal information), or if disclosure is required by law or is pertinent to judicial or governmental investigations or proceedings.</p>
                  
                  <p><strong>You Can Opt Out of Receiving Further Marketing from Quantos at Any Time</strong><br />
                  We, or select third parties, may contact you regarding various products and services that may be of interest to you. If you do not wish to be contacted, simply tell us when you give us your personal information. Or, at any time you can easily opt out of receiving further marketing from QUANTOS by emailing us at sales@quantos.com.</p>
                  
                  <p><strong>Our Commitment to Data Security</strong><br />
                  To prevent unauthorized access, maintain data accuracy, and ensure the correct use of information, we have put in place appropriate physical, electronic, and managerial procedures to safeguard and secure the information we collect online.</p>
                  
                  <p><strong>How to Contact Us</strong><br />
                  If you would like to contact us for any reason regarding our privacy practices, please write us at the following address:</p>
                  
                  <p>Privacy Information Manager, c/o Quantos Software, LLC, 185 Lookout Dr. Dayton, OH 45419.</p>
                </>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-border bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-[#1448b8] rounded-md transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
