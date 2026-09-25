import mongoose from 'mongoose';
import { calculateReadiness } from '../lib/utils';
import Project from '../models/Project';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge-mvp';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Project.deleteMany({});

  const projects = [
    {
      basicInfo: {
        name: 'Nova Flagship Experience',
        clientName: 'Nova Fashion Studio',
        description: 'Complete overhaul of the e-commerce flagship store to increase conversion rates.',
        website: 'https://nova-fashion.com',
        targetPlatforms: ['Web', 'iOS'],
      },
      status: 'Ready for Dev' as const,
      brand: {
        personality: ['Elegant', 'Modern'],
        colors: [
          { hex: '#000000', role: 'Primary', source: 'client' as const },
          { hex: '#f3f4f6', role: 'Background', source: 'ai' as const }
        ],
        typography: ['Inter'],
        visualStyle: 'Minimalist luxury',
        tone: 'Sophisticated'
      },
      product: {
        objective: 'Increase mobile conversions',
        targetUsers: ['Fashion enthusiasts'],
        userJourneys: ['Browse -> Add to Cart -> Checkout'],
        coreFeatures: ['AR Try-on', 'One-click checkout'],
        successMetrics: ['20% increase in mobile CVR']
      },
      guardrails: {
        always: ['Use high-res images'],
        never: ['Use pop-ups on mobile']
      },
      aiAnalysis: {
        summary: 'A high-impact project focused on mobile experience.',
        modules: ['Catalog', 'Cart', 'Checkout'],
        risks: ['AR implementation complexity'],
        clarificationQuestions: [],
        complexity: 'High' as const
      },
      prd: {
        sections: [
          { title: 'Executive Summary', content: 'Modernize the digital flagship.' }
        ]
      },
      technicalPlan: {
        frontend: { recommendation: 'Next.js App Router', rationale: 'For best SEO and performance.' },
        backend: { recommendation: 'Node.js API', rationale: 'To integrate with existing systems.' },
        database: { recommendation: 'MongoDB', rationale: 'For flexible product schemas.' },
        integrations: []
      },
      tasks: [
        { id: 'TASK-1', epic: 'Frontend', title: 'Setup Next.js', ownerRole: 'Frontend Eng', priority: 'High', estimateDays: 2, status: 'Done' as const },
        { id: 'TASK-2', epic: 'Frontend', title: 'Implement Header', ownerRole: 'Frontend Eng', priority: 'Medium', estimateDays: 1, status: 'In Progress' as const }
      ]
    },
    {
      basicInfo: {
        name: 'Apex Fleet Telematics',
        clientName: 'Apex Logistics',
        description: 'Real-time dashboard for tracking 500+ delivery vehicles.',
        targetPlatforms: ['Web'],
      },
      status: 'Analyzed' as const,
      brand: {
        personality: ['Reliable', 'Industrial'],
        colors: [
          { hex: '#ea580c', role: 'Brand', source: 'client' as const }
        ],
        typography: ['Roboto'],
        visualStyle: 'Utilitarian',
        tone: 'Direct'
      },
      product: {
        objective: 'Reduce fleet downtime',
        targetUsers: ['Dispatchers'],
        userJourneys: ['View fleet -> Identify issue -> Dispatch maintenance'],
        coreFeatures: ['Live map', 'Alerting'],
        successMetrics: ['10% reduction in downtime']
      },
      guardrails: {
        always: ['Ensure map is performant'],
        never: ['Use complex animations']
      },
      aiAnalysis: {
        summary: 'Heavy data visualization required.',
        modules: ['Map', 'Alerts', 'Reports'],
        risks: ['WebSocket scale'],
        clarificationQuestions: ['What is the refresh rate?'],
        complexity: 'High' as const
      }
    },
    {
      basicInfo: {
        name: 'Zeta Flow Engine',
        clientName: 'Zeta Tech',
        description: 'Internal workflow builder for HR department.',
        targetPlatforms: ['Web'],
      },
      status: 'Draft' as const,
    }
  ];

  for (let p of projects) {
    const score = calculateReadiness(p);
    await Project.create({ ...p, readinessScore: score });
  }

  console.log('Database seeded successfully');
  await mongoose.disconnect();
}

seed().catch(console.error);
