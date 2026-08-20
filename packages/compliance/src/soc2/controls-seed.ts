export const SOC2_CONTROLS_SEED = [
  {
    controlId: 'CC1.1',
    category: 'CC1' as const,
    title: 'Control Environment - COSO Principle 1',
    description: 'The entity demonstrates a commitment to integrity and ethical values.',
  },
  {
    controlId: 'CC2.1',
    category: 'CC2' as const,
    title: 'Communication and Information - Internal Communication',
    description: 'The entity obtains or generates and uses relevant, quality information to support the functioning of internal controls.',
  },
  {
    controlId: 'CC3.1',
    category: 'CC3' as const,
    title: 'Risk Assessment - Specifies Objectives',
    description: 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.',
  },
  {
    controlId: 'CC4.1',
    category: 'CC4' as const,
    title: 'Monitoring Activities - Conducts Ongoing Evaluations',
    description: 'The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.',
  },
  {
    controlId: 'CC5.1',
    category: 'CC5' as const,
    title: 'Control Activities - Selects and Develops Control Activities',
    description: 'The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.',
  },
  {
    controlId: 'CC6.1',
    category: 'CC6' as const,
    title: 'Logical and Physical Access - Access Restrictions',
    description: 'The entity implements logical access security software, infrastructure, and architectures to protect against unauthorized access.',
  },
  {
    controlId: 'CC6.2',
    category: 'CC6' as const,
    title: 'Logical and Physical Access - User Registration',
    description: 'New internal and external users are registered and granted access credentials based on authorization from the system owner.',
  },
  {
    controlId: 'CC7.2',
    category: 'CC7' as const,
    title: 'System Operations - Monitoring for Anomalies',
    description: 'The entity monitors system components and the operation of those components for anomalies.',
  },
  {
    controlId: 'CC8.1',
    category: 'CC8' as const,
    title: 'Change Management - Manages Changes to Infrastructure',
    description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its change management objectives.',
  },
  {
    controlId: 'CC9.1',
    category: 'CC9' as const,
    title: 'Risk Mitigation - Identifies and Manages Business Disruption Risks',
    description: 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.',
  },
] as const
