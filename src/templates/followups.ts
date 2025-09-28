export const followUpTemplates = {
  'applied-3d': {
    subject: 'Following up on my application',
    body: `Hi [Name],

I hope this email finds you well. I wanted to follow up on the [Job Title] position I applied for on [Date]. I'm very excited about this opportunity and would love to discuss how my skills and experience can contribute to your team.

I understand you're likely reviewing many applications, but I wanted to express my continued interest in the role. If you need any additional information or have any questions about my application, please don't hesitate to reach out.

Thank you for your time and consideration.

Best regards,
[Your Name]`
  },
  'applied-7d': {
    subject: 'Checking in on application status',
    body: `Hi [Name],

I hope you're having a great week. I wanted to check in regarding the [Job Title] position I applied for on [Date]. I remain very interested in this opportunity and would appreciate any updates you might have on the hiring timeline.

I'm confident that my background in [Relevant Skills] would be a great fit for your team, and I'd welcome the chance to discuss this further.

Thank you for your time.

Best regards,
[Your Name]`
  },
  'interview-2d': {
    subject: 'Thank you for the interview',
    body: `Hi [Name],

Thank you for taking the time to interview me yesterday for the [Job Title] position. I really enjoyed our conversation and learning more about the role and your team.

I'm even more excited about the opportunity after speaking with you. I believe my experience with [Relevant Skills] would allow me to make a meaningful contribution to your projects.

Please let me know if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
[Your Name]`
  },
  'interview-5d': {
    subject: 'Following up on interview next steps',
    body: `Hi [Name],

I hope you're doing well. I wanted to follow up on our interview for the [Job Title] position that took place on [Date]. I remain very interested in this opportunity and would love to know if there are any updates on the hiring timeline.

I'm confident that my skills and experience would be a great fit for your team, and I'm excited about the possibility of contributing to your projects.

Thank you for your time and consideration.

Best regards,
[Your Name]`
  }
};

export type FollowUpType = keyof typeof followUpTemplates;



