"use client";
import Button2 from "@/app/components/Button2";
import Footer from "@/app/components/Footer";
import FooterBottom from "@/app/components/FooterBottom";
import FrontNavOverlay from "@/app/components/FrontNavOverlay";
import StaggeredSlideUp from "@/app/components/StaggeredSlideUp";

import { useInView } from "motion/react";
import { useRef } from "react";
import StaggeredFadeIn from "@/app/components/StaggeredFadeIn";
export default function Home() {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);
  return (
    <>
      {/* Navigation */}
      <FrontNavOverlay color="dark" />

      {/* subline rightection */}
      <div className="grid grid-cols-12 z-1 mx-auto container  relative font-plecnik">
        <div className="z-1 grid gap-8 col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-16 col-start-1 ">
            {/* Description and CTA Section */}
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={100}
                className=" max-w-2/4 "
              >
                {" "}
                <h2 className="text-7xl leading-none text-neutral-700 pb-3 font-plecnik ">
                  At 1SP, our passionate team thrives on creativity
                </h2>
                <h2 className="text-7xl leading-none text-neutral-500  pb-3 font-plecnik ">
                  but legally compliant digital experiences are also important.
                </h2>
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto container  relative font-plecnik">
        <div className="z-1 grid gap-8 col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-8 col-start-1 ">
            {/* Description and CTA Section */}
            <div className="flex flex-col items-start gap-8  ">
              <StaggeredFadeIn>
                <h3 className="text-5xl">
                  Name and contact data of the person responsible for the
                  processing and the company data protection officer
                </h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  This data protection information applies to the data
                  processing by: 1SP Agency Holding GmbH represented by the
                  Managing Directors and Markus Ernst Oeller and Torsten
                  Oppermann
                  <br />
                  Hamburger Straße 11, 22083 Hamburg
                  <br />
                  Telephone: +49 (451) 160 83 500
                  <br />
                  Fax: +49 (451) 30 50 988
                  <br />
                  Mail: info@msm.digital
                  <br />
                  The 1SP Agency Holding GmbH company data protection officer
                  can be contacted under the above address respectively under
                  datenschutz@msm.digital.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">
                  Collecting and storing personal data plus nature and purpose
                  of its use
                </h3>
              </StaggeredFadeIn>{" "}
              <StaggeredFadeIn>
                <h3 className="text-5xl">When visiting the website</h3>
              </StaggeredFadeIn>{" "}
              <StaggeredFadeIn>
                <p className="text-lg">
                  When visitors leave comments on the site we collect the data
                  shown in the comments form, and also the visitor’s IP address
                  and browser user agent string to help spam detection. When you
                  open our website www.msm.digital, the browser used on your
                  device automatically sends information to our website’s
                  server. This information is stored temporarily in a so-called
                  “logfile”. The following information is collected, without you
                  having to do anything, and stored until it is erased
                  automatically after one week. IP address of the accessing
                  computer, The date and time of access, the name and the URL of
                  the file retrieved, Website from which access was made
                  (referrer-URL), Browser used and possibly your computer’s
                  operating system as well as the name of your access provider.
                  We will process the data stated for the following purposes: to
                  guarantee a smooth connection with the website, to ensure that
                  our website is convenient to use, to evaluate system security
                  and stability, as well as for other administrative purposes.
                  The legal basis for data processing is Article 6 para. 1 S. 1
                  lit. f GDPR. Our legitimate interest arises from the purposes
                  of data collection stated above. Under no circumstances will
                  we use the data collected for the purpose of drawing
                  conclusions about your person. Furthermore, when you visit our
                  website, we use cookies and analytical services. You can find
                  more information on this under items 4 and 5 of this data
                  protection information.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">When contacting us</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  If you upload images to the website, you should avoid
                  uploading images with embedded location data (EXIF GPS)
                  included. Visitors to the website can download and extract any
                  location data from images on the website. For all kinds of
                  queries, we offer you the possibility of contacting us by
                  telephone, mail, WhatsApp, or Facebook Messenger. The data
                  processing for the purpose of contacting us takes place in
                  accordance with Article 6 para. 1 S. 1 lit. a GDPR on the
                  basis of your voluntarily granted consent respectively,
                  inasmuch that you have expressed a specific interest in a
                  contract, on the basis of Article 6 para. 1 lit. b GDPR for
                  the performance of pre-contractual measures.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Disclosure of data</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  A transfer of your personal data to third parties shall not
                  take place for purposes other than those listed below. We
                  shall only share your personal data with third parties if: you
                  have given explicit consent for this in accordance with
                  Article 6 para. 1 S. 1 lit. a GDPR, the disclosure pursuant to
                  Article 6 para. 1 S. 1 lit. f GDPR is required for
                  establishment, exercise or defence of legal claims and there
                  are no grounds to accept that you have an overriding interest
                  in non-disclosure of your data, a legal obligation exists for
                  the transfer pursuant to Article 6 para. 1 S. 1 lit. c GDPR as
                  well as this is legally permissible and is required pursuant
                  to Article 6 para. 1 S. 1 lit. b GDPR for the concluding of a
                  contractual relationship with you.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Cookies</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  Articles on this site may include embedded content (e.g.
                  videos, images, articles, etc.). Embedded content from other
                  websites behaves in the exact same way as if the visitor has
                  visited the other website. We use cookies on our website.
                  These are small files which your browser creates automatically
                  and stores on your device (laptop, tablet, smartphone or
                  similar) when you visit our website. Cookies do not damage
                  your device in any way, nor do they contain any viruses,
                  trojans or other damaging software. Information is stored in
                  the cookie which is associated with the specific device used.
                  However, this does not mean that we receive direct information
                  about your identity. On the one hand, using cookies means that
                  use of our website will be more pleasant for you. Accordingly,
                  we use so-called "session cookies" to identify that you have
                  already visited individual pages on our website. These are
                  erased automatically when you leave our website. In addition,
                  we use temporary cookies to help optimise user friendliness
                  which are always stored on your device for a period of one
                  year. If you revisit our website to make use of our services,
                  the system will automatically recognise that you have already
                  visited us, and which input and settings you activated, so
                  that you do not have to enter these again. We also use cookies
                  to statistically record the use of our website, and so that we
                  can evaluate this to help optimise our services for you (see
                  point 5). These cookies allow us to identify that you have
                  already visited us when you revisit our website. These cookies
                  are always erased one year after your last visit,
                  Google-Cookies, however, (see point 5) only after two years.
                  The data processed by cookies are required for the purposes
                  stated to preserve our legitimate interests and those of third
                  parties in accordance with Article 6 para. 1 S. 1 lit. f GDPR.
                  Most browsers accept cookies automatically. However, you can
                  configure your browser so that no cookies are saved on your
                  computer, or that a warning always appears before a new cookie
                  is placed. Full deactivation of cookies, however, can mean
                  that you may not be able to use all the functions of our
                  website.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Analysis tools</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  The following tracking tools used by us are utilised in
                  accordance with Article 6 para. 1 S. 1 lit. f GDPR. With the
                  tracking measures used we aim to ensure appropriate design and
                  ongoing optimisation of our website. We also use the tracking
                  measures to statistically record the use of our website, and
                  so that we can evaluate this to help optimise our services for
                  you. These interests are legitimate within the meaning of the
                  directive above.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Google Analytics</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  Analytics, a web analysis service from Google LLC
                  (https://www.google.de/intl/de/about/) (1600 Amphitheatre
                  Parkway, Mountain View, CA 94043, USA; in the following
                  "Google") for the appropriate design and ongoing optimisation
                  or our website. With regard to this, pseudonymised usage
                  profiles and cookies (see point 4) are used. The information
                  about your use of this website created by the cookie such as
                  browser type/version, operating system used, referrer URL code
                  (previously visited site), host name of the accessing computer
                  (IP address), and time of the server query are transferred to
                  a Google server in the USA and stored there. This information
                  is used to evaluate the use of the website in order to
                  generate reports on website activity and to provide further
                  services relating to website use and internet use for the
                  purposes of market research and to enable these web pages to
                  be developed in line with requirements. This information may
                  be passed on to third parties in so far as is prescribed by
                  law or where third parties are processing the data on behalf
                  of Google. Your IP address will never be merged with any other
                  Google data. The IP addresses are anonymised, so that
                  allocation is not possible (IP masking). You can prevent the
                  storage of cookies by using the appropriate setting on the
                  browser software; however, we would point out that if this is
                  done, it may not be possible to use all functions of this
                  website to their full extent. In addition, you can prevent
                  collection of the data on your use of the website (including
                  your IP address) generated by the cookie, and also prevent the
                  processing of this data by Google by downloading and
                  installing a browser add-on. For further information with
                  regard to data protection associated with Google Analytics,
                  please refer to Google Analytics Help.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Google Adwords Conversion Tracking</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  We use the services of Google Adwords to draw attention to our
                  offers with the help of advertising media (so-called Google
                  Adwords) on external websites. In relation to the data of the
                  advertising campaigns, we can determine how successful the
                  individual advertising measures are. In doing so, we pursue
                  the interest of showing you advertising that is of interest to
                  you and of making our website more interesting for you and of
                  achieving a correct calculation in terms of advertising costs.
                  These advertising media are delivered by Google via so-called
                  "Ad Servers". We use ad server cookies for this purpose, which
                  can be used to measure certain parameters for measuring
                  success, such as the display of ads or clicks by users. If you
                  access our website via a Google ad, Google Adwords stores a
                  cookie on your PC. These cookies usually lose their validity
                  after 30 days and are not intended to identify you personally.
                  For this cookie, the unique cookie ID, number of ad
                  impressions per placement (frequency), last impression
                  (relevant for post-view conversions) and opt-out information
                  (marking that the user no longer wishes to be addressed) are
                  usually stored as analysis values. These cookies allow Google
                  to recognize your Internet browser. In case a user visits
                  certain pages of an AdWords customer's website and the cookie
                  stored on their computer has not yet expired, Google and the
                  customer may recognize that the user clicked on the ad and was
                  directed to that page. Each Adwords customer is assigned a
                  different cookie. Therefore cookies cannot be traced via the
                  websites of Adwords customers. We ourselves do not collect and
                  process any personal data in the aforementioned advertising
                  measures. We only receive statistical evaluations from Google.
                  On the basis of these evaluations we can recognize which of
                  the advertising measures used are particularly effective. We
                  do not receive any further data from the use of the
                  advertising media; in particular, we cannot identify users on
                  the basis of this information. Due to the marketing tools
                  used, your browser automatically establishes a direct
                  connection with the Google server. We have no influence on the
                  extent and further use of the data collected by Google through
                  the use of this tool and therefore inform you according to our
                  state of knowledge: Through the integration of AdWords
                  Conversion, Google receives the information that you have
                  clicked the relevant part of our website or clicked on an
                  advertisement from us. If you are registered with a Google
                  service, Google can assign the visit to your account. Even if
                  you are not registered with Google or have not logged in, it
                  is possible for the provider to find out and store your IP
                  address. You can prevent participation in this tracking
                  process in various ways: a) by making the appropriate settings
                  in your browser software, in particular by suppressing third
                  party cookies to prevent you from receiving advertisements
                  from third parties; b) by deactivating cookies for conversion
                  tracking by setting your browser to block cookies from the
                  "www.googleadservices.com" domain,
                  https://www.google.de/settings/ads, whereby this setting is
                  deleted when you delete your cookies; c) by disabling the
                  interest-based ads of the providers that are part of the
                  "About Ads" self-regulatory campaign via the
                  http://www.aboutads.info/choices link, whereby this setting is
                  deleted when you delete your cookies; d) by permanently
                  disabling it in your Firefox, Internet Explorer or Google
                  Chrome browsers via the
                  http://www.google.com/settings/ads/plugin link. Please note
                  that in this case you may not be able to make full use of all
                  the functions of this offer. The legal basis for the
                  processing of your data is Art. 6 Para. 1 S. 1 lit. f DSGVO.
                  Further information on data protection at Google can be found
                  here: http://www.google.com/intl/de/policies/privacy and
                  https://services.google.com/sitestats/de.html. Alternatively,
                  you can visit the website of the Network Advertising
                  Initiative (NAI) at http://www.networkadvertising.org. We use
                  Google Analytics' 3rd-party audience data such as age, gender,
                  and interests to better understanding the behavior of our
                  customers and work with companies that collect information
                  about your online activities to provide advertising targeted
                  to suit your interests and preferences. For example, you may
                  see certain ads on this website or other websites because we
                  contract with Google and other similar companies to target our
                  ads based on information we or they have collected, including
                  information that was collected through automated means (such
                  as cookies and web beacons). These companies also use
                  automated technologies to collect information when you click
                  on our ads, which helps track and manage the effectiveness of
                  our marketing efforts. You may opt out of the automated
                  collection of information by third-party ad networks for the
                  purpose of delivering advertisements tailored to your
                  interests, by visiting the consumer opt-out page for the
                  Self-Regulatory Principles for Online Behavioral Advertising
                  at http://www.aboutads.info/choices/ and edit or opt-out your
                  Google Display Network ads' preferences at
                  http://www.google.com/ads/preferences/.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Google Remarketing</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  Besides Adwords Conversion we use the application Google
                  Remarketing. This is a process by which we would like to
                  address you again. With this application, you will be shown
                  our advertisements after visiting our website when you
                  continue to use the Internet. This is done by means of cookies
                  stored in your browser, which are used by Google to record and
                  evaluate your usage behaviour when you visit various websites.
                  This allows Google to determine your previous visit to our
                  website. According to Google's own statements, the data
                  collected within the scope of marketing is not combined with
                  your personal data, which may be stored by Google. In
                  particular, according to Google, a pseudonymisation is used
                  for remarketing.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Google Web Fonts</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  For uniform representation of fonts, this page uses web fonts
                  provided by Google. When you open a page, your browser loads
                  the required web fonts into your browser cache to display
                  texts and fonts correctly. For this purpose your browser has
                  to establish a direct connection to Google servers. Google
                  thus becomes aware that our web page was accessed via your IP
                  address. The use of Google Web fonts is done in the interest
                  of a uniform and attractive presentation of our website. This
                  constitutes a justified interest pursuant to Art. 6 (1) (f)
                  DSGVO. If your browser does not support web fonts, a standard
                  font is used by your computer. The legal basis for the use of
                  Google Web Fonts is Art. 6 Para. 1 S. 1 lit. f DSGVO. Third
                  party information: Google Dublin, Google Ireland Ltd., Gordon
                  House, Barrow Street, Dublin 4, Ireland, Fax: +353 (1) 436
                  1001. Terms of Use:
                  http://www.google.com/analytics/terms/de.html, Privacy Policy:
                  http://www.google.com/intl/de/analytics/learn/privacy.html
                  and: http://www.google.de/intl/de/policies/privacy.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Facebook Marketing Services</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">use-based advertising.</p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">
                  Use of Facebook Custom Audiences
                </h3>{" "}
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  The website uses the remarketing function "Custom Audiences"
                  of Facebook Inc. ("Facebook"). This allows users of the Site
                  to display interest-based ads ("Facebook Ads") when visiting
                  the Facebook social network or other sites that also use the
                  process. We are interested in displaying advertisements that
                  are of interest to you in order to make our website more
                  interesting to you. Due to the marketing tools used, your
                  browser automatically establishes a direct connection with the
                  Facebook server. We have no influence on the extent and
                  further use of the data collected by Facebook through the use
                  of this tool and therefore inform you according to our state
                  of knowledge: By integrating Facebook Custom Audiences,
                  Facebook receives the information that you have clicked the
                  corresponding site of our website or clicked on an
                  advertisement from us. If you are registered with a Facebook
                  service, Facebook can assign the visit to your account. Even
                  if you are not registered with Facebook or have not logged in,
                  it is possible for the provider to find out and store your IP
                  address and other identification features. You can find the
                  deactivation function of the "Facebook Custom Audiences" here
                  and for logged in users at
                  https://www.facebook.com/settings/?tab=ads# . The legal basis
                  for the processing of your data is Art. 6 Para. 1 S. 1 lit. f
                  DSGVO. Further information on data processing by Facebook can
                  be found at https://www.facebook.com/about/privacy.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Social Media</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  On our website we use, on the basis of Article 6 para. 1 S. 1
                  lit. f GDPR social plugins from the social networks Facebook,
                  LinkedIn and XING in order to make ourselves better known and
                  to offer you a variety of communication channels. The purpose
                  behind this corresponds to our legitimate interest, Article 6
                  para.1 lit. f GDPR. The relevant provider must guarantee
                  responsibility for operation of the social networks that
                  conforms to data protection regulations. Incorporating this
                  plugin by the provider takes place as part of the "two-click
                  method", in order to give you the best possible protection.
                  This means that, when a user visits our website, initially no
                  personal data whatsoever is transmitted to the provider of the
                  plugins. You can recognise the provider of the plugins by the
                  marking on the field above the first letters of his name or by
                  the respective logo (e.g. for Facebook: white "f" on blue tile
                  or a "Thumbs up"-sign). We offer you the possibility of
                  communicating directly with the provider of the plugin via the
                  button. Only when you click on the marked field and, as a
                  result, activate it, does the plugin provider receive the
                  information that a user has opened the corresponding website
                  for our online offerings. Furthermore, personal data is then
                  transmitted to the provider of the respective plugin (in
                  particular the IP address). In the case of Facebook and Xing,
                  according to the respective providers in Germany, the IP
                  address is anonymized immediately after being recorded. As a
                  result of the plugin being activated the user's personal data
                  is transmitted to the respective plugin provider and stored
                  there (in the case of US American providers in the USA). Since
                  the plugin provider performs his data collection, in
                  particular, via cookies, we recommend that, before clicking on
                  the greyed-out field, you delete all cookies using your
                  browser's security settings. We have no influence over the
                  collected data and data processing activities, nor are we
                  aware of the full extent of data collection, the purpose of
                  the processing or the storage periods at the plugin providers.
                  We also have no information for the erasure of the data
                  collected by the plugin provider. The respective plug-in
                  provider stores the data collected on the users of our online
                  offerings and uses them for the purpose of advertising, market
                  research and/or needs based design of its own website. Such an
                  evaluation is carried out in particular (also for non-logged
                  in users) for the presentation of needs based advertising and
                  to inform other users of the social network about the
                  activities of the users on our website. Users have the right
                  to object to the creation of these user profiles, whereby a
                  user must contact the respective plug-in provider to exercise
                  this right. By means of the plug-ins we offer you, independent
                  of this, the opportunity to interact with the social networks
                  and other users, so that we can improve our offer and make it
                  more interesting for our users. The dissemination of data
                  takes place regardless of whether the user has an account with
                  the plugin provider or is logged in there. If you are logged
                  in at the plugin provider your data, collected by us, is
                  assigned directly to your existing account with the plugin
                  provider. If you press the activated button and, for example,
                  link the page, the plugin provider stores this information on
                  the appropriate user account and publicly informs your
                  contacts. We therefore recommend that, after using a social
                  network, to regularly log off, especially before activating
                  the button, in this way an assignment to the profile at the
                  plugin provider can be avoided. More information regarding the
                  purpose and scope of the data collection and its processing by
                  the plugin providers, can be found in the privacy policies of
                  these providers provided below. There one can find more
                  information on the users' rights and the setting possibilities
                  for the protection of privacy within these networks. a)
                  Facebook Inc., 1601 S California Ave, Palo Alto, California
                  94304, USA; http://www.facebook.com/policy.php; further
                  information on data collection:
                  http://www.facebook.com/help/186325668085084. b) Xing AG,
                  Gänsemarkt 43, 20354 Hamburg, DE; http://www.xing.com/privacy.
                  c) LinkedIn Corporation, 2029 Stierlin Court, Mountain View,
                  California 94043, USA;
                  http://www.linkedin.com/legal/privacy-policy.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Hubspot</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  Our registration service allows visitors of our website to
                  learn more about our company, download content, and provide
                  their contact information and other demographic information.
                  This information is stored on servers of our software partner
                  HubSpot. We may use this information to contact visitors to
                  our website and to determine which services of our company are
                  of interest to them. All information collected by us is
                  subject to this Privacy Policy. We use all information
                  collected solely to improve our marketing. We use HubSpot for
                  our online marketing activities. HubSpotis an integrated
                  software solution that covers various aspects of our online
                  marketing activities. These include among others: Reporting
                  (e.g. traffic sources, accesses, etc.) Contact management
                  (e.g. user segmentation & CRM) HubSpot is a software company
                  based in the USA with an office in Ireland. Contact us:
                  HubSpot 2nd floor, 30 North Wall Quay Dublin 1, Ireland Phone:
                  +353 1 5187500 HubSpot is certified under the terms of the
                  EU-U.S. Privacy Shield Framework or Swiss-U.S. Privacy Shield
                  Framework and is subject to TRUSTe's Privacy Seal. More
                  information about HubSpot's privacy policy More information
                  from HubSpot regarding EU data protection regulations More
                  information about the cookies used by HubSpot can be found
                  here& here
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Rights of data subjects</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  You have the right, pursuant to Article 15 GDPR, to request
                  information about your personal data processed by us. In
                  particular, you can request information about the purpose of
                  processing, the category of the personal data, the categories
                  of recipients, to whom your data were or will be disclosed,
                  the envisaged period of storage, the existence of a right to
                  rectification, erasure, restriction of processing or
                  objection, existence of the right to lodge a complaint, the
                  origin of your data insofar as they were not collected by us,
                  as well as the existence of automated decision making
                  including profiling and if required, meaningful information
                  relating to the details of this. We may only refuse to give
                  you information, if and inasmuch, that the information given
                  would reveal information, that, in accordance with a legal
                  regulation or due to its nature, in particular because of the
                  overwhelming legitimate interest of a third party must be kept
                  secret (§ 29 para. 1 S. 2 BDSG), if the responsible public
                  body has informed us that the publication of the data would
                  jeopardise public safety or order or in any other manner the
                  interests of the republic or of a federal state (§ 34 para. 1
                  no. 1 BDSG in conjunction with § 33 para. 1 no. 2 lit. b
                  BDSG), or if the data is only stored for legal or statutory
                  reasons and may not be erased, or only serves the purpose of
                  data security or data protection control and the provision of
                  information would involve a disproportionate effort, or if the
                  processing for other purposes using suitable technical and
                  organisational measures is precluded (§ 34 para. 1 no. 2
                  BDSG). pursuant to Article 16 GDPR, to request immediate
                  rectification of inaccurate data or the completion of your
                  personal data which we have stored; pursuant to Article 17
                  GDPR, you may request the erasure of the personal data we have
                  stored, where processing is not required for exercising the
                  right of freedom of expression and information, for compliance
                  with a legal obligation, for reasons of public interest, for
                  the establishment, exercise or defence of legal claims;
                  pursuant to Article 18 GDPR, to request the restriction of
                  processing, where the accuracy of the personal data is
                  contested by you, the processing is unlawful, however you
                  oppose the erasure of the personal data, and we no longer need
                  the data, however you require them for the establishment,
                  exercise or defence of legal claims, or you have objected to
                  the processing pursuant to Article 21 GDPR. pursuant to
                  Article 20 GDPR, to receive the personal data you made
                  available to us in a structured, commonly used and
                  machine-readable format, or to request it is sent to another
                  controller; pursuant to Article 7 para. 3 GDPR, to withdraw
                  the consent you have given us at any time. As a consequence of
                  this, we may no longer perform the data processing based on
                  this consent in the future, if your personal data is processed
                  based on legitimate interests in accordance with Article 6
                  para. 1 S. 1 lit. f GDPR, pursuant to Article 21 GDPR to
                  object to the processing of your personal data, provided that
                  there are grounds that relate to your particular situation or
                  where you are objecting to direct marketing. In the latter
                  case, you have a general right to objection, which we will
                  implement without you needing to specify a particular
                  situation. Furthermore, you have a general right to lodge a
                  complaint with the data protection supervisory authorities
                  responsible for you. The supervisory authority responsible for
                  the 1SP Agency Holding is the "Landesbeauftragte für
                  Datenschutz Hamburg" (State officer for data protection
                  Hamburg). If you want to exercise your right to withdraw
                  consent or object, it is adequate if you send an email to
                  dataprivacy@msm.digital.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">Data security</h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  During your visit to our website, we use the widely-used SSL
                  process (Secure Socket Layer), along with the highest current
                  level of encryption supported by your browser. This generally
                  involves 256 Bit encryption. If your browser does not support
                  256 Bit encryption, we then resort to 128 Bit v3 technology.
                  You can identify whether an individual page on our website is
                  encrypted by the closed image of the key or lock symbol in the
                  lower status bar of your browser. In addition, we use
                  appropriate technical and organisational security measures to
                  protect your data against accidental or deliberate
                  manipulation, partial or complete loss, destruction, or
                  unauthorised access by third parties. Our security measures
                  are continually improved in line with technical developments.
                </p>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <h3 className="text-5xl">
                  Actuality and amendments to this data protection declaration
                </h3>
              </StaggeredFadeIn>
              <StaggeredFadeIn>
                <p className="text-lg">
                  This data protection information is currently valid and is
                  dated June 2019. As a result of the further development of our
                  website and offers therein or due to changed legal or official
                  requirements, it may be necessary to change this data
                  protection information. You may download and print the
                  relevant current privacy policy from our website at
                  www.msm.digital/data-protection/.
                </p>
              </StaggeredFadeIn>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      {/* Footer Bottom */}
      <FooterBottom />
    </>
  );
}
