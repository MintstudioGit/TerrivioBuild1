
interface CategoryData {
  useCases: string[];
  signals: string[];
}

export const TAXONOMY: Record<string, CategoryData> = {
  "Sales": {
    useCases: [
      "Cold Email Outreach", "LinkedIn Prospecting", "Account Research", "Ideal Customer Profile", 
      "Lead Qualification", "Territory Planning", "Contact Discovery", "Warm Introduction Requests",
      "Discovery Call Scripts", "Sales Call Prep", "Demo Scripts", "Presentation Decks",
      "Follow-up Sequences", "Objection Handling", "Negotiation Scripts", "Proposal Writing",
      "Contract Review", "Closing Techniques", "Urgency Creation", "Pricing Discussions"
    ],
    signals: [
      "Demo Booked", "Meeting Scheduled", "Qualified Lead", "SQL Generated", "Pipeline Created",
      "Opportunity Advanced", "Proposal Sent", "Contract Signed", "Deal Closed", "Revenue Generated",
      "High-Value Target", "Decision Maker Reached", "Pain Point Identified", "Budget Confirmed",
      "Quick Response", "Short Cycle", "Low Effort", "High Win-Rate"
    ]
  },
  "Marketing": {
    useCases: [
      "Facebook Ad Copy", "Google Ad Copy", "LinkedIn Ad Copy", "Display Ad Copy",
      "Retargeting Campaigns", "Ad Creative Briefs", "Landing Page Copy", "CTA Optimization",
      "Email Campaigns", "Product Launch Plans", "Event Promotion", "Webinar Marketing",
      "Growth Strategy", "Channel Planning", "Conversion Optimization", "Funnel Analysis"
    ],
    signals: [
      "High CTR", "High Conversion Rate", "Low CPA", "High ROAS", "Viral Coefficient >1",
      "Organic Reach", "Paid Efficiency", "Channel ROI", "Attribution Clear", "Measurable Impact",
      "High Engagement Rate", "Social Shares", "Community Growth", "Brand Awareness",
      "Lead Generation", "MQL Creation", "Pipeline Contribution", "Revenue Attribution"
    ]
  },
  "Content": {
    useCases: [
      "Blog Post Outlines", "SEO Articles", "Pillar Content", "Content Clusters", "How-to Guides",
      "Listicles", "Tutorial Content", "Industry Reports", "Research Posts", "Content Calendar",
      "White Papers", "E-books", "Case Studies", "Success Stories", "Industry Guides",
      "Content Refresh", "Meta Descriptions", "Title Tag Optimization", "Internal Linking"
    ],
    signals: [
      "SEO-Optimized", "High Rankings", "Featured Snippet", "Backlink Magnet", "Organic Traffic",
      "Low Bounce Rate", "High Dwell Time", "Internal Link Value", "Keyword Dominance",
      "High Readability", "Shareability", "Bookmark-Worthy", "Evergreen Value", "Authority Building",
      "Lead Capture", "Email Signups", "Trial Signups", "Product Interest"
    ]
  },
  "Writing": {
    useCases: [
      "Value Propositions", "Headlines", "Taglines", "Product Descriptions", "Feature Benefits",
      "Call-to-Action Copy", "Button Copy", "Microcopy", "Error Messages", "Tooltips",
      "Welcome Emails", "Newsletter Copy", "Promotional Emails", "Transactional Emails",
      "Website Copy", "About Us Pages", "Testimonials", "FAQ Answers", "Chatbot Scripts"
    ],
    signals: [
      "High-Converting", "Compelling CTA", "Urgency-Driven", "Benefit-Focused", "Problem-Aware",
      "Solution-Clear", "Objection-Handled", "Value-Packed", "Trust-Building", "Action-Oriented",
      "Clear Messaging", "Easy to Scan", "Simple Language", "Jargon-Free", "Concise",
      "Emotionally Resonant", "Socially Proof", "Authority-Backed", "Scarcity-Based"
    ]
  },
  "Product": {
    useCases: [
      "Product Roadmaps", "Feature Prioritization", "User Stories", "Product Requirements (PRD)",
      "Market Research", "Competitive Analysis", "Feature Specs", "Release Planning",
      "Sprint Planning", "Backlog Management", "Feature Launches", "Beta Programs",
      "Release Notes", "Change Logs", "Product Updates", "Feature Announcements"
    ],
    signals: [
      "High-Impact Feature", "User-Requested", "Competitive Advantage", "Market Differentiator",
      "Revenue Driver", "Retention Booster", "Adoption Accelerator", "Workflow Improvement",
      "Technically Feasible", "Quick to Ship", "Low Complexity", "Scalable Solution",
      "Vision-Aligned", "Roadmap Priority", "OKR-Driven", "Data-Informed"
    ]
  },
  "Development": {
    useCases: [
      "React Components", "Vue Components", "UI Components", "Form Handling", "State Management",
      "Routing Logic", "API Integration", "Error Handling", "API Endpoints", "Database Schemas",
      "SQL Queries", "Authentication", "Authorization", "WebSocket Handlers", "Cron Jobs",
      "CI/CD Pipelines", "Docker Configs", "Deployment Scripts", "Monitoring Setup"
    ],
    signals: [
      "Production-Ready", "Well-Tested", "Type-Safe", "Error-Handled", "Security-Hardened",
      "Performance-Optimized", "Memory-Efficient", "Scalable Code", "Clean Architecture",
      "Fast Implementation", "Quick to Deploy", "Rapid Iteration", "Minimal Dependencies",
      "Readable Code", "Well-Documented", "Modular Design", "Reusable Components"
    ]
  },
  "Design": {
    useCases: [
      "Component Design", "Page Layouts", "Navigation Patterns", "Form Design", "Modal Design",
      "Empty States", "Error States", "Loading States", "Micro-interactions", "Animation Specs",
      "User Flows", "Wireframes", "Prototypes", "User Research Plans", "Usability Testing",
      "Design Systems", "Style Guides", "Icon Design", "Illustration Guidelines"
    ],
    signals: [
      "Intuitive Interface", "User-Friendly", "Accessibility (A11y)", "Mobile-Optimized",
      "Responsive Design", "Touch-Optimized", "Keyboard-Accessible", "Screen-Reader Ready",
      "Visually Appealing", "Brand-Aligned", "Modern Design", "Minimalist", "Color-Harmonious",
      "Smooth Animations", "Delightful Micro-interactions", "Fast Feedback", "Error Prevention"
    ]
  },
  "Customer Success": {
    useCases: [
      "Ticket Responses", "FAQ Creation", "Help Articles", "Troubleshooting Guides", "Bug Reports",
      "Escalation Handling", "Apology Templates", "Status Updates", "Proactive Outreach",
      "Welcome Sequences", "Setup Guides", "Tutorial Creation", "First-use Tips", "Feature Tours",
      "Check-in Emails", "Usage Reports", "Feature Adoption", "Renewal Campaigns"
    ],
    signals: [
      "High CSAT", "High NPS", "Positive Feedback", "Resolution Speed", "First Contact Resolution",
      "Empathy-Driven", "Personalized Response", "Proactive Support", "Self-Service Enabled",
      "Churn Prevention", "Renewal Secured", "Expansion Opportunity", "Feature Adoption",
      "Automated Response", "Scalable Support", "Reduced Tickets", "Deflection Rate"
    ]
  },
  "Operations": {
    useCases: [
      "SOP Creation", "Workflow Design", "Process Documentation", "Task Templates", "Checklist Creation",
      "Meeting Agendas", "Meeting Notes", "Status Reports", "Project Plans", "Timeline Creation",
      "Zapier Workflows", "Email Automation", "Slack Bots", "Notification Rules", "Task Automation",
      "Team OKRs", "Performance Reviews", "1-on-1 Prep", "Hiring Plans", "Resource Allocation"
    ],
    signals: [
      "Time-Saved", "Cost-Reduced", "Process-Streamlined", "Automation-Enabled", "Manual Work Eliminated",
      "Bottleneck Removed", "Workflow Optimized", "Resource-Optimized", "Waste-Eliminated",
      "Error-Reduced", "Consistency-Improved", "Compliance-Met", "Standard-Followed",
      "Cross-Functional", "Team-Aligned", "Communication-Clear", "Transparency-High"
    ]
  },
  "Analytics": {
    useCases: [
      "Dashboard Design", "Executive Reports", "Weekly Reports", "Monthly Reports", "Quarterly Reviews",
      "KPI Tracking", "Metric Definitions", "Data Visualization", "Trend Analysis", "Cohort Analysis",
      "A/B Test Analysis", "Funnel Analysis", "User Behavior Analysis", "Churn Analysis",
      "Data Storytelling", "Insight Generation", "Recommendation Reports", "Performance Attribution"
    ],
    signals: [
      "Actionable Insights", "Data-Driven Decision", "Clear Recommendation", "Hypothesis-Tested",
      "Statistically Significant", "Confidence-High", "Validated Finding", "Predictive Accuracy",
      "Revenue-Attribution", "ROI-Calculated", "Efficiency-Measured", "Performance-Improved",
      "Easy-to-Understand", "Visual-First", "Executive-Ready", "Story-Told"
    ]
  },
  "HR & Recruiting": {
    useCases: ["Job Descriptions", "Interview Questions", "Offer Letters", "Onboarding Plans", "Performance Improvement Plans", "Employee Handbooks", "Culture Guides", "Exit Interviews", "Training Manuals", "Diversity Initiatives", "Benefit Summaries", "Recruitment Emails", "LinkedIn Outreach", "Candidate Feedback", "Role Competencies"],
    signals: ["Top Talent Hired", "Time-to-Fill Reduced", "Retention Improved", "Culture-Fit Aligned", "Candidate Experience", "Bias-Reduced", "Compliance-Met", "Engagement-High", "Onboarding-Speed"]
  },
  "Legal": {
    useCases: ["Contract Review", "NDA Drafting", "Terms of Service", "Privacy Policies", "Cease & Desist Letters", "Compliance Audits", "Risk Assessments", "Legal Memos", "Dispute Resolution", "Patent Applications", "Licensing Agreements", "Vendor Contracts", "Board Resolutions", "Meeting Minutes"],
    signals: ["Risk Mitigated", "Compliance-Assured", "Liability-Reduced", "IP-Protected", "Clear Terms", "Dispute-Avoided", "Audit-Ready", "Legally Sound", "Loophole-Closed"]
  },
  "Finance": {
    useCases: ["Budget Planning", "Expense Analysis", "Financial Modeling", "Investment Memos", "Cash Flow Forecasts", "Investor Updates", "Tax Planning", "Payroll Audits", "Vendor Negotiation", "Pricing Strategy", "Revenue Recognition", "Cost Reduction Plans", "Audit Prep", "Cap Table Management"],
    signals: ["Cost Optimized", "Revenue Maximized", "Cash Flow Positive", "Audit-Passed", "Investor-Ready", "Margin-Improved", "Forecast-Accurate", "Risk-Managed", "Tax-Efficient"]
  },
  "Education": {
    useCases: ["Lesson Plans", "Curriculum Design", "Quiz Generation", "Rubric Creation", "Student Feedback", "Parent Emails", "IEP Goals", "Study Guides", "Lecture Notes", "Assignment Prompts", "Classroom Activities", "Learning Objectives", "Course Syllabi", "Worksheets"],
    signals: ["Learning Outcome Met", "Student Engagement", "Knowledge Retention", "Skill Mastery", "Classroom-Control", "Differentiated Instruction", "Assessment-Valid", "Parent-Informed"]
  },
  "Real Estate": {
    useCases: ["Listing Descriptions", "Market Analysis", "Buyer Emails", "Seller Updates", "Open House Flyers", "Lease Agreements", "Neighborhood Guides", "Investment Analysis", "Offer Letters", "Counter-Offers", "Tenant Screening", "Property Management", "Virtual Tour Scripts", "Social Media Posts"],
    signals: ["Property Sold", "Offer Accepted", "High ROI", "Tenant-Qualified", "Vacancy-Reduced", "Market-Value Met", "Closing-Speed", "Client-Satisfied", "Listing-Viral"]
  },
  "E-commerce": {
    useCases: ["Product Titles", "SEO Descriptions", "Ad Retargeting", "Abandoned Cart Emails", "Customer Reviews", "Upsell Scripts", "Unboxing Experience", "Influencer Briefs", "Store Policies", "FAQ Sections", "Category Pages", "Promotional Banners", "Loyalty Programs", "Gift Guides"],
    signals: ["Sales Boosted", "Conversion Increased", "AOV-Higher", "Cart-Recovery", "Review-Positive", "Return-Rate Reduced", "Traffic-High", "Brand-Loyalty", "SEO-Ranking"]
  },
  "Healthcare": {
    useCases: ["Patient Instructions", "Symptom Checkers", "Appointment Reminders", "Wellness Plans", "Dietary Guidelines", "Post-Op Care", "Telehealth Scripts", "Insurance Appeals", "Medical Summaries", "Referral Letters", "Public Health Advisories", "Staff Protocols", "Patient Education", "Consent Forms"],
    signals: ["Patient Adherence", "Outcome-Improved", "Readmission-Reduced", "Understanding-Clear", "Trust-Built", "Compliance-HIPAA", "Efficiency-High", "Error-Reduced"]
  },
  "Executive Admin": {
    useCases: ["Meeting Prep", "Email Triage", "Calendar Management", "Travel Itineraries", "Speech Writing", "Strategic Memos", "Board Presentations", "Quarterly Planning", "Action Item Tracking", "Stakeholder Updates", "Decision Frameworks", "Briefing Docs", "Networking Emails", "Gift Ideas"],
    signals: ["Time Saved", "Focus-Enhanced", "Decision-Fast", "Communication-Clear", "Logistics-Smooth", "Stakeholder-Aligned", "Priority-Managed", "Crisis-Averted"]
  },
  "Social Media": {
    useCases: ["Viral Hooks", "Thread Writing", "Caption Optimization", "Influencer Outreach", "Content Calendar", "Trend Analysis", "Community Management", "Poll Creation", "Storyboards", "Bio Optimization", "Hashtag Strategy", "DM Scripts", "Contest Rules", "Engagement Replies"],
    signals: ["High Engagement", "Viral-Reach", "Follower-Growth", "Community-Active", "Brand-Voice", "Click-Through-High", "Share-Worthy", "Trend-Aligned"]
  },
  "Event Planning": {
    useCases: ["Run of Show", "Vendor Emails", "Speaker Invites", "Promotion Plan", "Registration Pages", "Sponsorship Decks", "Post-Event Surveys", "Venue Research", "Catering Menus", "Budget Trackers", "Swag Ideas", "Staff Briefings", "Emergency Protocols", "Thank You Notes"],
    signals: ["Sold Out", "Smooth Execution", "Attendee-Delight", "Budget-Adhered", "Sponsor-Happy", "No-Hiccups", "Feedback-Positive", "Memorable-Experience"]
  },
  "Travel & Logistics": {
    useCases: ["Itinerary Planning", "Packing Lists", "Booking Confirmations", "Local Guides", "Visa Applications", "Route Optimization", "Inventory Tracking", "Shipment Notifications", "Driver Instructions", "Customs Forms", "Warehouse Layouts", "Supply Requests", "Travel Policy", "Expense Reports"],
    signals: ["Trip Planned", "Logistics-Optimized", "Cost-Saved", "On-Time Delivery", "Compliance-Met", "Stress-Free", "Inventory-Accurate", "Route-Efficient"]
  },
  "Academic Research": {
    useCases: ["Literature Review", "Abstract Writing", "Methodology Design", "Grant Proposals", "Citation Management", "Peer Review", "Conference Posters", "Thesis Statements", "Data Analysis Plan", "Survey Design", "Ethics Applications", "Journal Submissions", "Lab Notebooks", "Research Impact"],
    signals: ["Grant Funded", "Published-Paper", "Methodology-Robust", "Citation-High", "Peer-Approved", "Novel-Contribution", "Clarity-High", "Rigor-Maintained"]
  },
  "Data Science": {
    useCases: ["Model Selection", "Feature Engineering", "Data Cleaning", "Results Interpretation", "Experiment Design", "Pipeline Architecture", "Visualization Specs", "Documentation", "Code Reviews", "Algorithm Explanation", "Bias Audits", "Performance Tuning", "Deployment Strategy", "Version Control"],
    signals: ["Model Accuracy", "Data-Clean", "Insight-Valid", "Performance-Fast", "Reproducible", "Bias-Mitigated", "Scalable-Solution", "Stakeholder-Understood"]
  },
  "Cybersecurity": {
    useCases: ["Incident Response", "Penetration Testing", "Policy Enforcement", "Risk Assessment", "Phishing Simulations", "Audit Logs", "Vulnerability Scans", "Access Controls", "Security Training", "Threat Intelligence", "Disaster Recovery", "Compliance Checks", "Patch Management", "Encryption Standards"],
    signals: ["Secure System", "Breach-Prevented", "Compliance-Met", "Risk-Low", "Response-Fast", "User-Aware", "Vulnerability-Patched", "Data-Protected"]
  },
  "IT Support": {
    useCases: ["Ticket Resolution", "Knowledge Base", "User Guides", "System Diagnostics", "Password Reset", "Hardware Setup", "Software Installation", "Network Troubleshooting", "Remote Access", "Asset Management", "SLA Tracking", "Outage Communication", "Vendor Support", "Upgrade Planning"],
    signals: ["Ticket Closed", "User-Satisfied", "Downtime-Reduced", "First-Contact-Fix", "Documentation-Clear", "System-Stable", "Response-Fast", "Asset-Tracked"]
  },
  "Quality Assurance": {
    useCases: ["Test Plans", "Bug Reports", "Regression Testing", "Automation Scripts", "User Acceptance", "Load Testing", "Security Testing", "Mobile Testing", "API Testing", "Test Cases", "Defect Tracking", "Release Sign-off", "Quality Metrics", "Root Cause Analysis"],
    signals: ["Bug Free", "Release-Ready", "Coverage-High", "Critical-Issues-Found", "User-Experience-Smooth", "Performance-Stable", "Automation-Efficient", "Standards-Met"]
  },
  "Localization": {
    useCases: ["Translation", "Cultural Adaptation", "Subtitling", "Market Fit Analysis", "Glossary Creation", "Style Guides", "QA Checks", "Voiceover Scripts", "Date/Time Formats", "Currency Conversion", "Legal Compliance", "UI Layout", "Testing Scripts", "Feedback Loops"],
    signals: ["Market Fit", "Culturally-Appropriate", "Translation-Accurate", "User-Native-Feel", "Compliance-Local", "Brand-Consistent", "Launch-Successful", "Errors-Zero"]
  },
  "Video & Media": {
    useCases: ["Scriptwriting", "Storyboarding", "Shot Lists", "Editing Notes", "Sound Design", "Casting Calls", "Location Scouting", "Production Schedule", "Release Forms", "Metadata Tags", "Thumbnail Ideas", "Series Bible", "Director Notes", "Livestream Run-of-Show"],
    signals: ["High Retention", "Visual-Stunning", "Story-Compelling", "Production-Efficient", "Audio-Clear", "Audience-Hooked", "Schedule-Met", "Viral-Potential"]
  },
  "Public Relations": {
    useCases: ["Press Releases", "Media Pitches", "Crisis Response", "Brand Messaging", "Media Lists", "Interview Prep", "Talking Points", "Op-Eds", "Speech Writing", "Event Briefs", "Coverage Reports", "Award Submissions", "Influencer Kits", "Fact Sheets"],
    signals: ["Media Coverage", "Brand-Reputation", "Crisis-Managed", "Message-Aligned", "Audience-Reached", "Sentiment-Positive", "Placement-High-Value", "Authority-Built"]
  },
  "Fundraising": {
    useCases: ["Donor Emails", "Grant Applications", "Pitch Decks", "Impact Reports", "Campaign Slogans", "Thank You Letters", "Sponsorship Levels", "Event Scripts", "Donor Personas", "Annual Reports", "Case for Support", "Direct Mail", "Board Updates", "Giving Tuesday"],
    signals: ["Funded", "Goal-Exceeded", "Donor-Retained", "Impact-Clear", "Story-Moving", "Trust-Built", "Network-Expanded", "Mission-Aligned"]
  },
  "Gaming": {
    useCases: ["Level Design", "NPC Dialogue", "Quest Creation", "Game Mechanics", "Lore Writing", "Character Backstories", "Item Descriptions", "Tutorial Scripts", "Patch Notes", "Steam Page Copy"],
    signals: ["Player-Immersed", "Balanced-Gameplay", "Retention-High", "Lore-Consistent", "Mechanic-Engaging", "Review-Positive"]
  },
  "Music": {
    useCases: ["Song Lyrics", "Chord Progressions", "Band Bios", "Press Kits", "Spotify Canvas Ideas", "Music Video Scripts", "Setlists", "Tour Planning", "Merch Ideas", "Social Teasers"],
    signals: ["Viral-Hit", "Fan-Connected", "Brand-Defined", "Stream-Count-High", "Show-Sold-Out", "Creative-Flow"]
  },
  "Architecture": {
    useCases: ["Concept Statements", "Site Analysis", "Client Briefs", "Material Selection", "Sustainability Goals", "Project Timelines", "Zoning Research", "Interior Moodboards", "Lighting Plans"],
    signals: ["Client-Approved", "Sustainable-Design", "Code-Compliant", "Visually-Stunning", "Space-Optimized", "Budget-Met"]
  },
  "Fashion": {
    useCases: ["Trend Forecasting", "Collection Themes", "Fabric Sourcing", "Runway Show Run-of-Show", "Product Descriptions", "Brand Story", "Influencer Gifting", "Lookbook Concepts"],
    signals: ["Trend-Setting", "Sales-High", "Brand-Cohesive", "Media-Attention", "Sustainable-Sourced", "Customer-Loyal"]
  },
  "Nonprofit": {
    useCases: ["Volunteer Recruitment", "Impact Stories", "Board Agendas", "Grant Reporting", "Donor Stewardship", "Program Logic Models", "Advocacy Emails", "Fundraising Events", "Newsletter Content"],
    signals: ["Mission-Advanced", "Volunteer-Engaged", "Donor-Retained", "Impact-Measured", "Community-Served", "Funding-Secured"]
  }
};

export const CATEGORIES = Object.keys(TAXONOMY);
