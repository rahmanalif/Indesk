export interface LegalDocumentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  effectiveDate: string;
  intro: string[];
  sections: LegalDocumentSection[];
}

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy Policy',
    summary:
      'How UK InKind Psychology Ltd collects, uses, safeguards, retains, and shares subscriber, visitor, and patient data within InDesk.',
    effectiveDate: 'March 2026',
    intro: [
      'InDesk is built by clinicians for clinicians. We take data protection seriously - not just because the law requires it, but because our platform handles some of the most sensitive information that exists.',
    ],
    sections: [
      {
        heading: '1.1 About This Document',
        paragraphs: [
          'This Privacy Policy describes how UK InKind Psychology Ltd - the company behind the InDesk practice management platform - collects, uses, and safeguards personal information. It applies to subscribers, website visitors, and the patients or clients whose records practitioners manage through InDesk.',
          'We hold two distinct roles under data protection law.',
        ],
        bullets: [
          'Data controller - for information we collect directly about subscribers and website visitors in order to run our business.',
          "Data processor - for patient and client records entered by practitioners. In that context, the practitioner is the controller; we act solely on their instructions.",
          'Our ICO registration number is ZB983152. Data protection enquiries can be directed to info@myindesk.com.',
        ],
      },
      {
        heading: '1.2 Our Details',
        paragraphs: [],
        bullets: [
          'Company: UK InKind Psychology Ltd',
          'Registration number: 16096179',
          'Address: Blaeford Gordon & Co Ltd 101 Galgate, Barnard Castle, County Durham, DL12 8ES, United Kingdom',
          'Email: info@myindesk.com',
          'Website: www.myindesk.com',
          'ICO reference: ZB983152',
        ],
      },
      {
        heading: '1.3 Information We Collect About Subscribers',
        paragraphs: [
          'Provided directly by you:',
        ],
        bullets: [
          'Registration details: name, professional title, practice name and address, email, and professional registration number.',
          'Account configuration: settings and preferences you apply within InDesk.',
          'Payment details: managed entirely by our payment processor. We do not store card or bank details.',
          'Communications: support requests, feedback, and any other messages you send us.',
          'Collected automatically:',
          'Technical identifiers: IP address, device type, operating system, and browser details.',
          'Usage patterns: feature access, session durations, and navigation behaviour used to improve the product.',
          'Cookie data: described in full in our Cookie Policy.',
        ],
      },
      {
        heading: '1.4 Patient and Client Records',
        paragraphs: [
          "When practitioners use InDesk to manage their caseload, they may enter detailed records about individuals in their care. We process this information strictly as a data processor, acting on the practitioner's instructions. It may include names, contact details, clinical notes, assessment outcomes, and treatment records - all of which constitute special category health data under Article 9 of the UK GDPR, and all of which receive our highest level of security and access control.",
          'We will never use patient records for commercial purposes, marketing, or any purpose beyond delivering the agreed service.',
          'Our AI assistant is a general-purpose tool that is entirely isolated from clinical data. It cannot access, read, search, or retrieve any patient records, clinical notes, or personal data stored within your InDesk account. No clinical or patient data is transmitted to or processed by the AI assistant at any time.',
          'You must not enter identifiable patient or client information into the AI assistant under any circumstances.',
        ],
      },
      {
        heading: '1.5 Why We Process Your Information',
        paragraphs: [],
        bullets: [
          'Account creation and management - legal basis: performance of contract.',
          'Billing and payment processing - legal basis: performance of contract.',
          'Customer support - legal basis: legitimate interests; note: keeping your practice running.',
          'Platform improvement - legal basis: legitimate interests; note: aggregated, anonymised data.',
          'Essential account communications - legal basis: legitimate interests; note: cannot be opted out.',
          'Marketing and product news - legal basis: consent; note: withdraw at any time.',
          'Legal and regulatory compliance - legal basis: legal obligation; example: HMRC, ICO.',
        ],
      },
      {
        heading: '1.6 How Long We Keep Information',
        paragraphs: [],
        bullets: [
          'Subscriber account data: retained for the duration of your subscription and for seven years after it ends, in line with professional indemnity and contract limitation periods.',
          'Patient and client records: you determine how long records are kept within InDesk. When your account closes, Patient Data is deleted from live systems within 45 days. Encrypted system backups are retained for up to 24 months for disaster recovery but cannot be individually accessed or extracted.',
          'Website and analytics data: anonymised analytics are kept for up to 24 months. Identifiable access logs are deleted within 90 days.',
          'Financial records: retained for seven years to meet HMRC obligations.',
        ],
      },
      {
        heading: '1.7 Who We Share Information With',
        paragraphs: [
          'We do not sell or rent personal information. We may share it with:',
        ],
        bullets: [
          'Technology partners who help us deliver InDesk - cloud hosting, email infrastructure, payment processing, error monitoring. All operate under data processing agreements and may only use your information as we instruct.',
          'Professional advisers - solicitors, accountants, and insurers - under strict confidentiality obligations.',
          'Regulators and law enforcement - where required by law.',
          'A successor organisation - if InDesk is acquired or merged. You will be notified before any such transfer and your rights will be preserved.',
          'A full sub-processor list is available on request.',
        ],
      },
      {
        heading: '1.8 International Transfers',
        paragraphs: [
          "We store all personal data within the UK and EEA. If any sub-processor's infrastructure requires a transfer outside these territories, we ensure that an appropriate safeguard - such as a UK International Data Transfer Agreement approved by the ICO - is in place before the transfer occurs.",
        ],
      },
      {
        heading: '1.9 How We Keep Your Data Safe',
        paragraphs: [],
        bullets: [
          'All data in transit is encrypted using TLS 1.3.',
          'Data stored at rest is encrypted using AES-256.',
          'Platform access requires multi-factor authentication.',
          'Permissions follow the principle of least privilege.',
          'We carry out regular independent security assessments.',
          'All team members with data access receive information security training.',
          'We maintain a documented incident response process and report breaches to the ICO as required.',
        ],
      },
      {
        heading: '1.10 Your Rights',
        paragraphs: [
          'To exercise any right, write to info@myindesk.com. We will respond within one calendar week.',
        ],
        bullets: [
          'Access: request a copy of the personal information we hold about you.',
          'Correction: ask us to update any inaccurate or incomplete information.',
          'Erasure: request deletion of your data, subject to legal retention requirements.',
          'Restriction: ask us to pause processing while a dispute is resolved.',
          'Portability: receive your data in a structured, machine-readable format.',
          'Object: object to processing based on legitimate interests, or to direct marketing.',
          'Withdraw consent: withdraw consent at any time where consent is our legal basis.',
        ],
      },
      {
        heading: '1.11 Children',
        paragraphs: [
          'InDesk is a professional tool for qualified practitioners. We do not knowingly collect personal information directly from children under 18. Where a practitioner records information about a minor as part of their clinical practice, obtaining all necessary consents is the practitioner\'s responsibility.',
        ],
      },
      {
        heading: '1.12 Policy Updates',
        paragraphs: [
          'We review this policy at least annually. For significant changes, we will notify you by email at least 30 days before they take effect. The current version is always available at www.myindesk.com.',
        ],
      },
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    shortTitle: 'Terms of Service',
    summary:
      'The subscription terms governing access to the InDesk platform, including fees, cancellation, data controller duties, AI use, warranties, and liability.',
    effectiveDate: 'March 2026',
    intro: [
      'These are the terms governing your InDesk subscription. Please read them before you sign up. If anything is unclear, contact us first.',
    ],
    sections: [
      {
        heading: '2.1 Definitions',
        paragraphs: [],
        bullets: [
          'Agreement - this Terms of Service document, together with the Privacy Policy, Cookie Policy, Data Processing Agreement, and Acceptable Use Policy.',
          'InDesk / we / us - UK InKind Psychology Ltd.',
          'Subscriber / you - the practitioner or organisation that creates an InDesk account.',
          'Platform - the InDesk application, APIs, and supporting infrastructure.',
          'Patient Data - all information about identifiable individuals entered by Subscribers in the course of clinical practice.',
          'Subscription - the plan selected by the Subscriber, granting access to the Platform for the agreed term.',
          'Staff - individuals authorised by the Subscriber to access InDesk under their account.',
          'Intellectual Property Rights - patents, copyright, trademarks, design rights, database rights, and equivalent rights worldwide.',
        ],
      },
      {
        heading: '2.2 Forming This Agreement',
        paragraphs: [
          'This Agreement comes into effect when you complete account registration. Starting a free trial also constitutes acceptance. These terms govern the entire relationship between us and replace any prior discussions or representations.',
        ],
      },
      {
        heading: '2.3 What We Provide',
        paragraphs: [],
        bullets: [
          'We grant you a limited, non-exclusive, non-transferable licence to access and use the Platform during your Subscription, solely for managing your clinical practice.',
          'InDesk is a cloud-hosted service. You are responsible for your own internet connection and device configuration.',
          'All data is hosted within secure facilities in the UK and EEA.',
          'We may update the Platform at any time. We will give reasonable advance notice of material changes.',
          'We target platform availability of 99% or above per calendar month, excluding pre-announced maintenance.',
        ],
      },
      {
        heading: '2.4 Free Trial',
        paragraphs: [
          'New Subscribers may access a free trial period. No payment information is required to begin. At the end of the trial, you may choose a paid plan or allow access to lapse. We will not charge you without your affirmative selection of a paid plan.',
        ],
      },
      {
        heading: '2.5 Fees and Payment',
        paragraphs: [],
        bullets: [
          'Subscription fees are published on our pricing page and are quoted inclusive of VAT, which is charged at the current applicable rate for UK subscribers.',
          'Fees are payable monthly in advance unless an annual plan is chosen.',
          'Subscriptions renew automatically unless cancelled before the renewal date.',
          'We accept payment by credit or debit card via our secure payment processor.',
          'If a payment fails, we will notify you and allow reasonable time to resolve it before suspending access.',
          'Pricing changes take effect with at least 30 days written notice. You may cancel if you do not accept new pricing.',
        ],
      },
      {
        heading: '2.6 Cancellation',
        paragraphs: [
          'You may cancel at any time from within your account settings. Cancellation takes effect at the end of the current billing period. We do not issue refunds for unused portions, except where required by law.',
          'After cancellation, you have 30 days to export your data. Following that period, data will be securely deleted from live systems.',
        ],
      },
      {
        heading: '2.7 Termination by Us',
        paragraphs: [
          'We may suspend or terminate access immediately if:',
        ],
        bullets: [
          'You are in material breach of this Agreement and have not remedied it within 14 days of written notice.',
          'Your use of the Platform poses a risk to patient safety or to others.',
          'We are required to do so by law or by a regulator.',
          'Your account has been compromised and action is required to protect data.',
          'In all other circumstances, we will give at least 30 days written notice.',
        ],
      },
      {
        heading: '2.8 Your Responsibilities as Data Controller',
        paragraphs: [
          'You are the data controller for all patient and client records in InDesk. This means:',
        ],
        bullets: [
          'You must have a valid lawful basis for processing the personal data of every individual in your care.',
          'You must ensure patients and clients are informed that you use InDesk as a data processing platform.',
          'You must comply with the standards set by your professional body and any applicable regulation.',
          'You must ensure your Staff only access InDesk to the extent their role requires.',
        ],
      },
      {
        heading: '2.9 Support',
        paragraphs: [
          'Support is available via the in-platform help centre and by emailing info@myindesk.com. We aim to respond within one working day. Please do not include patient names or identifiable clinical information in support messages.',
        ],
      },
      {
        heading: '2.10 Intellectual Property',
        paragraphs: [
          'All Intellectual Property Rights in InDesk - including its code, design, content, and documentation - belong to UK InKind Psychology Ltd or are licensed to us. Your subscription grants you use of the Platform; it does not transfer any ownership rights.',
          'You retain full ownership of all data you enter into InDesk. We assert no intellectual property rights over your clinical content.',
          'You must not copy, reverse-engineer, or attempt to extract the source code of any part of InDesk, nor create any derivative product based on it.',
        ],
      },
      {
        heading: '2.11 Warranties and Disclaimers',
        paragraphs: [
          'We will deliver the Platform with reasonable care and skill and maintain appropriate security throughout your Subscription. Beyond this, InDesk is provided on an as-is basis. We do not warrant that it will be error-free, uninterrupted, or suited to every specific requirement.',
          'InDesk is an administrative and documentation tool. It does not provide clinical guidance, diagnoses, or treatment recommendations. All clinical decisions remain entirely the responsibility of the qualified practitioner.',
          'Where the AI Assistant feature is used, it must never be relied upon as a source of clinical fact. AI-generated content can contain errors and must always be reviewed and verified by a qualified practitioner before use.',
        ],
      },
      {
        heading: '2.12 AI Assistant',
        paragraphs: [
          'InDesk includes an AI assistant feature designed to help with general administrative tasks such as drafting correspondence, summarising non-clinical information, and supporting documentation workflows. The following rules govern its use.',
        ],
        bullets: [
          'Isolation from clinical data: the AI assistant has no access to any data held within your InDesk account. It cannot read, retrieve, or process patient records, clinical notes, assessment results, correspondence, or any other information stored in the Platform. This isolation is enforced at a technical level and cannot be overridden.',
          'Prohibition on entering clinical or patient data: you must not enter identifiable patient or client information into the AI assistant. This includes names, dates of birth, NHS or other health identifiers, clinical diagnoses, session notes, assessment scores, safeguarding information, or any other personal data relating to an individual in your care. Entering such information into the AI assistant would constitute a data protection breach for which you, as data controller, bear responsibility.',
          'Clinical reliance: the AI assistant is not a clinical tool. Outputs must not be used as the basis for clinical decisions, diagnoses, treatment recommendations, or risk assessments. All AI-generated content must be reviewed and verified by a qualified practitioner before use. We accept no liability for loss or harm arising from reliance on AI assistant outputs.',
          'Data processing: prompts you submit to the AI assistant and the responses generated are processed in accordance with our Privacy Policy. You remain responsible for ensuring that any content you submit to the AI assistant complies with your own data protection obligations.',
        ],
      },
      {
        heading: '2.13 Limitation of Liability',
        paragraphs: [],
        bullets: [
          'Nothing in this Agreement limits our liability for death or personal injury caused by negligence, for fraud, or for any other liability that cannot lawfully be excluded.',
          'Subject to the above, our total aggregate liability shall not exceed the total fees you paid in the 12-month period before the event giving rise to the claim.',
          'We are not liable for indirect or consequential loss, loss of profit, loss of revenue, loss of clinical data through your own actions, or loss of professional reputation.',
        ],
      },
      {
        heading: '2.14 General Provisions',
        paragraphs: [],
        bullets: [
          'Entire agreement: this Agreement supersedes all prior representations and understandings between the parties.',
          'Severability: if any provision is found unenforceable, the remainder continues in full force.',
          'Waiver: failure to enforce any provision is not a waiver of the right to enforce it later.',
          'Third party rights: this Agreement does not confer rights on third parties under the Contracts (Rights of Third Parties) Act 1999.',
          'Force majeure: neither party is liable for failure caused by events genuinely outside their reasonable control, provided prompt notice is given and reasonable mitigation steps are taken.',
          'Assignment: you may not assign your rights without our prior written consent. We may assign ours as part of a legitimate business restructuring.',
          'Governing law: this Agreement is governed by the law of England and Wales. Both parties submit to the exclusive jurisdiction of the courts of England and Wales.',
        ],
      },
    ],
  },
  {
    slug: 'terms-of-website-use',
    title: 'Terms of Website Use',
    shortTitle: 'Website Use',
    summary:
      'The terms governing access to the public InDesk website at myindesk.com, including restrictions on scraping, misuse, and unauthorised copying.',
    effectiveDate: 'March 2026',
    intro: [
      'These Terms of Website Use govern your access to the InDesk website at myindesk.com. By visiting the site, you accept these terms. If you do not agree, please do not continue to use it. These terms should be read alongside our Privacy Policy and Cookie Policy.',
    ],
    sections: [
      {
        heading: '3.1 Who We Are',
        paragraphs: [
          'UK InKind Psychology Ltd, a Limited Company registered in UK.',
        ],
      },
      {
        heading: '3.2 Availability and Changes',
        paragraphs: [
          'We update the site periodically and cannot guarantee that it will always be available or error-free. We may suspend, update, or withdraw access at any time without notice. We may amend these terms at any time; the current version on the site always applies.',
        ],
      },
      {
        heading: '3.3 Permitted and Prohibited Uses',
        paragraphs: [
          'You may browse the site for information about InDesk and engage with publicly available content. The following are not permitted:',
        ],
        bullets: [
          'Using the site for any unlawful purpose or in breach of these terms.',
          'Attempting to gain unauthorised access to any part of the site or its underlying systems.',
          'Introducing malicious code, viruses, or automated scripts designed to disrupt or damage the site.',
          'Systematically harvesting or scraping data from the site without our written permission.',
          'Framing or mirroring the site on another platform.',
          'Using site content for commercial purposes without obtaining a licence from us.',
        ],
      },
      {
        heading: '3.4 Intellectual Property',
        paragraphs: [
          'All content on the site - text, images, graphics, logos, and software - is owned by UK InKind Psychology Ltd or used under licence and is protected by copyright law. You may download content for personal, non-commercial reference. You must not reproduce, modify, or distribute site content for any other purpose without prior written consent.',
        ],
      },
      {
        heading: '3.5 External Links',
        paragraphs: [
          'Links to third-party websites are provided for convenience only. We do not endorse or take responsibility for the content or privacy practices of any external site. When you leave the InDesk site, we recommend reviewing the policies of wherever you go.',
        ],
      },
      {
        heading: '3.6 User Submissions',
        paragraphs: [
          'If the site allows you to submit content - such as enquiry forms - you are responsible for ensuring that content is accurate, lawful, and does not infringe third-party rights. We may remove any user-submitted content at our discretion.',
        ],
      },
      {
        heading: '3.7 No Reliance on Site Content',
        paragraphs: [
          'Site content is for general information only. It does not constitute clinical, legal, financial, or professional advice. We make reasonable efforts to keep it accurate but cannot guarantee this.',
        ],
      },
      {
        heading: '3.8 Our Liability',
        paragraphs: [
          'We do not exclude liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot lawfully be limited.',
          'Subject to that, we are not liable for any loss or damage arising from use of the site or reliance on its content, including loss of profits, business opportunity, or reputation.',
        ],
      },
      {
        heading: '3.9 Governing Law',
        paragraphs: [
          'These terms are governed by the law of England and Wales. Disputes are subject to the non-exclusive jurisdiction of the courts of England and Wales. Residents of Scotland or Northern Ireland may also bring proceedings in their local courts.',
        ],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    shortTitle: 'Cookie Policy',
    summary:
      'Explains what cookies are, which categories of cookies InDesk uses, and how visitors can manage their preferences.',
    effectiveDate: 'March 2026',
    intro: [
      'This Cookie Policy explains what cookies are, which ones InDesk uses, and how you can manage your preferences. Please also read our Privacy Policy for the full picture of how we handle personal data.',
    ],
    sections: [
      {
        heading: '4.1 What Is a Cookie?',
        paragraphs: [
          'A cookie is a small text file stored on your browser or device when you visit a website. Cookies allow sites to recognise your device on return visits, remember preferences, and understand how the site is used. They are not programs and cannot carry viruses.',
          'First-party cookies are set by InDesk. Third-party cookies are set by services we use, such as analytics tools. Cookies can be session-based (deleted when you close your browser) or persistent (remaining until they expire or you delete them).',
        ],
      },
      {
        heading: '4.2 Cookies InDesk Uses',
        paragraphs: [],
        bullets: [
          'Essential cookies: these are necessary for the platform to function. They manage secure logins, session continuity, and protection against cross-site attacks. They do not require consent and cannot be disabled through our cookie settings.',
          'Secure session management and authentication.',
          'CSRF protection.',
          'Server-side load balancing.',
          'Analytics and performance cookies: with your consent, we use analytics tools to understand how the site and platform are used. This helps us identify issues and improve the experience. Where possible, data is anonymised.',
          'Visitor counts and page engagement.',
          'Feature usage patterns.',
          'Performance and error monitoring.',
          'Functionality cookies: with your consent, these remember your preferences - such as display settings or your last-used view - across visits.',
          'Marketing cookies: with your consent, these may show you InDesk-related content on other platforms and help us measure the effectiveness of our marketing. We do not use marketing cookies to track clinical or patient activity.',
        ],
      },
      {
        heading: '4.3 Managing Your Preferences',
        paragraphs: [
          "A consent banner appears on your first visit. You may accept all cookies, accept essential cookies only, or set granular preferences. You can change your choices at any time using the 'Cookie settings' link in the site footer. Clearing cookies from your browser will reset your preferences.",
        ],
      },
      {
        heading: '4.4 Third-Party Cookies',
        paragraphs: [
          'Some cookies come from third-party tools we use. Those providers have their own cookie policies. We do not allow third parties to use cookies placed through InDesk for their own commercial purposes.',
        ],
      },
      {
        heading: '4.5 Further Information',
        paragraphs: [
          'Independent guidance on cookies can be found at ico.org.uk and www.allaboutcookies.org.',
        ],
      },
      {
        heading: '4.6 Changes to This Policy',
        paragraphs: [
          'We update this policy when we introduce new cookies or when the law changes. Material changes will be notified via the consent banner and, where appropriate, by email.',
        ],
      },
    ],
  },
  {
    slug: 'data-processing-agreement',
    title: 'Data Processing Agreement',
    shortTitle: 'DPA',
    summary:
      'The Article 28 UK GDPR processor terms covering how InDesk processes patient and client data on behalf of subscribers.',
    effectiveDate: 'March 2026',
    intro: [
      'This Data Processing Agreement (DPA) is required by Article 28 of the UK GDPR. It governs how InDesk processes patient and client data on your behalf as your data processor. By subscribing to InDesk, you agree to these terms.',
    ],
    sections: [
      {
        heading: '5.1 The Parties',
        paragraphs: [],
        bullets: [
          'The Controller: you, the InDesk subscriber, who determines the purpose and means of processing patient and client personal data.',
          "The Processor: UK InKind Psychology Ltd (InDesk), which processes that data on the Controller's behalf to deliver the Platform services.",
        ],
      },
      {
        heading: '5.2 Definitions',
        paragraphs: [
          'In this DPA, terms including Controller, Processor, Data Subject, Personal Data, Special Category Data, Processing, Personal Data Breach, and Supervisory Authority carry the meanings given to them in the UK GDPR and the Data Protection Act 2018.',
        ],
      },
      {
        heading: '5.3 What We Process on Your Behalf',
        paragraphs: [],
        bullets: [
          'Categories of personal data.',
          'Identification data: names, dates of birth, contact details, addresses.',
          'Clinical and health data (special category): presenting concerns, diagnoses, therapy notes, assessment outcomes, treatment records, and safeguarding information.',
          'Administrative data: invoicing and payment status where managed within the Platform.',
          'Correspondence records: appointment communications and secure messages sent through InDesk.',
          'Categories of data subjects.',
          'Patients and clients of the Subscriber.',
          'Third parties referenced in clinical records, such as GPs or other professionals, to the extent referenced by the Subscriber.',
          "Duration: processing continues for as long as the Subscriber's account is active and for any post-termination retention period specified in this DPA or required by law.",
        ],
      },
      {
        heading: "5.4 InDesk's Obligations as Processor",
        paragraphs: [],
        bullets: [
          'Process only on your instructions: we will process Patient Data only to deliver the Platform services you have contracted for and only as you direct. If we believe any instruction would breach applicable law, we will inform you promptly.',
          'Confidentiality of personnel: every team member with access to Patient Data is bound by a confidentiality agreement. Access is limited strictly to those who need it to fulfil their role.',
          'Technical and organisational security: we maintain security measures appropriate to the risk, including as a minimum:',
          'Encryption of Patient Data in transit using TLS 1.3.',
          'Encryption of Patient Data at rest using AES-256.',
          'Multi-factor authentication for all system access.',
          'Role-based access controls with comprehensive audit logging.',
          'Regular penetration testing and vulnerability assessments.',
          'Tested backup and disaster recovery procedures.',
          'Sub-processors: we may engage sub-processors - for cloud hosting, email delivery, error monitoring, and similar functions. We maintain a current sub-processor list, available on request, and will notify you at least 30 days before engaging a new sub-processor or making a material change. You may raise reasonable objections during that period. All sub-processors are bound by obligations equivalent to those in this DPA.',
          "Assisting with your obligations: we will provide reasonable assistance to help you meet your data controller obligations, including responding to data subject rights requests relating to Patient Data held on InDesk, supporting data protection impact assessments where InDesk's processing is relevant, and notifying you within 48 hours of becoming aware of an actual or suspected Personal Data Breach affecting Patient Data.",
          'Data deletion on account closure: within 45 days of your account closing, we will securely delete all Patient Data from live production systems. Encrypted backup copies retained for disaster recovery (up to 24 months) cannot be individually accessed or extracted. Please export your data before closure using the tools within the Platform.',
          'Audit and verification: on reasonable written notice, we will provide documentation to verify our compliance with this DPA. Where an on-site audit is requested, we reserve the right to agree timing and scope in advance and to recover reasonable costs.',
        ],
      },
      {
        heading: '5.5 Your Obligations as Controller',
        paragraphs: [],
        bullets: [
          'You must have a valid lawful basis for each category of personal data you process through InDesk.',
          'You must have provided transparent information to your patients and clients about your use of InDesk as a data processor.',
          'For special category health data, you must have explicit consent or another Article 9 condition in place.',
          'You must notify us promptly of any data subject request, complaint, or regulatory enquiry relating to Patient Data on InDesk.',
          'You must ensure Staff access InDesk only within the bounds of your own data protection arrangements.',
        ],
      },
      {
        heading: '5.6 International Data Transfers',
        paragraphs: [
          'We process Patient Data within the UK and EEA. Where any sub-processor requires a transfer outside these territories, we ensure that an appropriate legal mechanism - such as a UK International Data Transfer Agreement - is in place before the transfer occurs.',
        ],
      },
      {
        heading: '5.7 Governing Law',
        paragraphs: [
          'This DPA is governed by the law of England and Wales and forms part of the Agreement between us.',
        ],
      },
    ],
  },
  {
    slug: 'acceptable-use-policy',
    title: 'Acceptable Use Policy',
    shortTitle: 'Acceptable Use',
    summary:
      'The conduct standards for using InDesk, including lawful practice requirements, AI restrictions, safeguarding limits, and breach consequences.',
    effectiveDate: 'March 2026',
    intro: [
      'InDesk is designed to support ethical clinical practice. This policy sets the standards of conduct we expect from everyone who uses the Platform. Compliance is a condition of your subscription.',
    ],
    sections: [
      {
        heading: '6.1 Scope',
        paragraphs: [
          "This Acceptable Use Policy applies to all Subscribers and to any Staff, contractors, or other individuals accessing InDesk under a Subscriber's account. Subscribers are responsible for ensuring all users within their account are aware of and comply with this policy.",
        ],
      },
      {
        heading: '6.2 What InDesk Is For',
        paragraphs: [
          'InDesk is intended to support lawful, ethical healthcare and wellbeing practice. Permitted uses include:',
        ],
        bullets: [
          'Managing patient and client records in connection with your registered clinical practice.',
          'Scheduling appointments, generating clinical notes, and producing correspondence.',
          'Administering invoicing and payments related to your practice.',
          'Using clinical documentation and assessment tools within their intended scope.',
          'Communicating securely with patients and clients in a professional capacity.',
        ],
      },
      {
        heading: '6.3 Prohibited Conduct',
        paragraphs: [],
        bullets: [
          'Legal and ethical violations.',
          'Any activity that is unlawful under UK law or any jurisdiction in which you operate.',
          'Recording or storing personal data without a lawful basis or, where required, without the individual\'s consent.',
          'Misrepresenting your professional qualifications, registration status, or clinical competencies.',
          'Platform misuse.',
          'Sharing account credentials with individuals not authorised to access patient data within your practice.',
          'Allowing multiple named users to share a single user licence.',
          'Using automated tools or scripts to access, extract, or interact with the Platform.',
          'Attempting to probe, test, or circumvent the security of the Platform or its infrastructure.',
          'Uploading or transmitting malicious code of any kind.',
          'Content standards.',
          'Storing content that is discriminatory, abusive, or harmful to any individual.',
          'Using InDesk in any way that could facilitate harassment or targeting of a person.',
          'Uploading material that infringes the intellectual property rights of any third party.',
          'Professional standards.',
          'Using InDesk in a way that is inconsistent with the code of practice of your professional body, including but not limited to the BPS, BACP, HCPC, UKCP, or equivalent.',
          'Generating records that do not accurately reflect clinical interactions.',
        ],
      },
      {
        heading: '6.4 Safeguarding',
        paragraphs: [
          'InDesk supports the documentation of clinical work, including safeguarding concerns. The Platform does not provide automated safeguarding alerts or clinical decision support. All safeguarding responsibilities - including mandatory reporting obligations - remain entirely with the qualified practitioner.',
        ],
      },
      {
        heading: '6.5 AI Assistant Use',
        paragraphs: [
          'The AI assistant feature is available to support general administrative tasks. Its use is subject to the following requirements, which form part of this Acceptable Use Policy.',
        ],
        bullets: [
          'You must not enter any identifiable patient or client information into the AI assistant. This includes but is not limited to names, dates of birth, health record numbers, clinical diagnoses, therapy or session notes, assessment results, medication details, safeguarding information, or any other personal data relating to individuals in your care.',
          'You must not use the AI assistant as a substitute for clinical judgement. It must not be used to inform diagnoses, risk assessments, treatment planning, or any clinical decision-making process.',
          'All AI-generated content must be reviewed and verified before use. You are responsible for the accuracy and appropriateness of any content derived from the AI assistant that you include in clinical records, correspondence, or communications.',
          'You must ensure that your use of the AI assistant is consistent with the standards and guidance of your professional body, including in relation to record-keeping, consent, and the use of technology in practice.',
        ],
      },
      {
        heading: '6.6 Reporting Misuse',
        paragraphs: [
          'If you become aware of misuse of InDesk - including unauthorised access, a suspected data breach, or conduct that may put a patient at risk - please contact us immediately at info@myindesk.com. All reports are investigated promptly and in confidence.',
        ],
      },
      {
        heading: '6.7 Consequences of Breach',
        paragraphs: [
          'Depending on the nature and severity of a breach, we may:',
        ],
        bullets: [
          'Issue a formal written warning.',
          'Temporarily restrict access to some or all Platform features.',
          'Suspend the account pending investigation.',
          'Terminate the account in accordance with the Terms of Service.',
          'Report conduct to the ICO, a professional regulatory body, or law enforcement where required.',
        ],
      },
      {
        heading: '6.8 Policy Updates',
        paragraphs: [
          'We may update this policy at any time. We will notify you of material changes at least 30 days before they come into effect. Continued use of InDesk after the effective date constitutes acceptance.',
        ],
      },
    ],
  },
];

export const legalDocumentsBySlug = Object.fromEntries(
  legalDocuments.map((document) => [document.slug, document])
) as Record<string, LegalDocument>;
