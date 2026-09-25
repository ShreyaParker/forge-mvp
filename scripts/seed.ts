import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { calculateReadiness } from '../lib/utils';
import Project, { normalizeProject } from '../models/Project';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge-mvp';

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Project.deleteMany({});

  const projects = [
    {
      basicInfo: {
        name: 'Nova Flagship Experience',
        clientName: 'Nova Fashion Studio',
        description: 'Complete overhaul of the e-commerce flagship store to increase conversion rates with immersive modern luxury aesthetics.',
        website: 'https://nova-fashion.com',
        targetPlatforms: ['Web', 'iOS'],
      },
      status: 'Ready for Dev' as const,
      dna: {
        competitors: ['SSENSE', 'Farfetch', 'Net-a-Porter'],
        references: [
          {
            name: 'Aime Leon Dore',
            url: 'https://aimeleondore.com',
            notes: 'Benchmark for minimal typography and grid spacing',
          },
          {
            name: 'Acne Studios',
            url: 'https://acnestudios.com',
            notes: 'Inspiration for high-end micro-interactions',
          },
        ],
        persistentInstructions: 'Maintain ultra-clean visual fidelity with zero layout shifts. Mobile-first micro-interactions with luxury fashion editorial sensibility.',
      },
      brand: {
        personality: ['Sophisticated', 'Modern', 'Minimalist'],
        colors: [
          { hex: '#0a0a0c', role: 'Primary Dark', source: 'client' as const },
          { hex: '#f4f4f5', role: 'Background Light', source: 'client' as const },
          { hex: '#18181b', role: 'Surface Card', source: 'human_edited' as const },
          { hex: '#c0a080', role: 'Warm Champagne Accent', source: 'ai' as const },
        ],
        typography: ['Playfair Display', 'Inter'],
        visualStyle: 'Monochromatic luxury editorial with subtle warm metallic accents',
        tone: 'Refined, confident, and contemporary',
      },
      product: {
        objective: 'Elevate online customer experience and increase high-ticket mobile checkout conversions.',
        targetUsers: ['High-income fashion enthusiasts', 'VIP editorial clients', 'Mobile shoppers'],
        userJourneys: ['Editorial Discovery -> Curated Lookbook -> AR Size Try-On -> Instant Checkout'],
        coreFeatures: ['Visual Lookbook with Quick Shop', 'Clientele Concierge Chat', 'One-Click Apple Pay / Stripe Express Checkout'],
        successMetrics: ['25% increase in mobile conversion', '35% reduction in checkout abandonment'],
      },
      guardrails: {
        always: [
          { id: 'g-always-1', text: 'Use high-resolution WebP images with AVIF fallbacks', source: 'client' as const },
          { id: 'g-always-2', text: 'Enforce WCAG 2.1 AA accessibility on all contrast ratios', source: 'ai' as const },
          { id: 'g-always-3', text: 'Optimize first contentful paint under 1.2s on mobile 4G', source: 'human_edited' as const },
        ],
        never: [
          { id: 'g-never-1', text: 'Use intrusive discount popups or countdown timers on mobile entry', source: 'client' as const },
          { id: 'g-never-2', text: 'Include uncompressed raw asset bundles or auto-playing audio', source: 'human_edited' as const },
        ],
      },
      aiAnalysis: {
        summary: 'A high-impact project modernizing the digital flagship experience with low-latency e-commerce storefront architecture.',
        modules: ['Storefront Catalog', 'Editorial Lookbook', 'Cart & Express Checkout', 'Customer Portal'],
        risks: ['High resolution image weight impacting Core Web Vitals', 'Complex third-party inventory sync'],
        clarificationQuestions: ['What is the exact SLA on third-party ERP stock sync?'],
        complexity: 'High' as const,
      },
      prd: {
        sections: [
          {
            title: '1. Executive Summary',
            content: 'Modernize the digital flagship experience for Nova Fashion Studio to deliver high-converting luxury editorial shopping across web and iOS.',
          },
          {
            title: '2. Functional Requirements',
            content: '- Headless product catalog with faceted search\n- Multi-currency instant checkout\n- VIP customer tier authentication',
          },
          {
            title: '3. Technical Constraints',
            content: '- Server-side rendering for optimal search engine indexing\n- CDN edge caching with stale-while-revalidate',
          },
        ],
      },
      technicalPlan: {
        frontend: {
          recommendation: 'Next.js 15 (App Router)',
          rationale: 'Server-side rendering, streaming, and edge caching critical for e-commerce SEO and sub-second page loads.',
          isApproved: true,
        },
        backend: {
          recommendation: 'Next.js Server Actions & Route Handlers',
          rationale: 'Co-located secure backend logic with zero operational overhead and type-safe server mutations.',
          isApproved: true,
        },
        database: {
          recommendation: 'MongoDB Atlas',
          rationale: 'Dynamic product attribute documents and nested inventory variations without migration friction.',
          isApproved: true,
        },
        auth: {
          recommendation: 'Auth.js (NextAuth v5)',
          rationale: 'Seamless customer social logins and secure JWT session handling with cookie encryption.',
          isApproved: false,
        },
        infrastructure: {
          recommendation: 'Vercel Edge Network',
          rationale: 'Global asset edge routing, automated image optimization, and instant cache invalidation.',
          isApproved: true,
        },
        integrations: [
          {
            name: 'Shopify Storefront API',
            rationale: 'Headless commerce catalog, order management, and secure checkout handoff.',
            isApproved: true,
          },
          {
            name: 'Klaviyo',
            rationale: 'Customer segmentation and automated lifecycle transactional emails.',
            isApproved: false,
          },
        ],
      },
      tasks: [
        {
          id: 'TASK-1',
          epic: 'Storefront',
          title: 'Implement Next.js 15 App Shell & Theme Tokens',
          ownerRole: 'Frontend Eng',
          priority: 'High',
          estimateDays: 2,
          status: 'Done' as const,
        },
        {
          id: 'TASK-2',
          epic: 'Storefront',
          title: 'Build Responsive Editorial Lookbook Grid',
          ownerRole: 'Frontend Eng',
          priority: 'High',
          estimateDays: 3,
          status: 'Done' as const,
        },
        {
          id: 'TASK-3',
          epic: 'Checkout',
          title: 'Integrate Shopify Storefront Headless Cart',
          ownerRole: 'Full Stack',
          priority: 'High',
          estimateDays: 4,
          status: 'In Progress' as const,
        },
        {
          id: 'TASK-4',
          epic: 'Checkout',
          title: 'Configure Stripe Express Checkout & Apple Pay',
          ownerRole: 'Backend Eng',
          priority: 'Medium',
          estimateDays: 2,
          status: 'Todo' as const,
        },
        {
          id: 'TASK-5',
          epic: 'Infrastructure',
          title: 'Setup Vercel Edge Cache Invalidation Webhooks',
          ownerRole: 'DevOps',
          priority: 'Medium',
          estimateDays: 1,
          status: 'Todo' as const,
        },
      ],
    },
    {
      basicInfo: {
        name: 'Apex Fleet Telematics',
        clientName: 'Apex Logistics',
        description: 'Real-time dashboard for tracking 500+ commercial delivery vehicles with live geolocation telemetry and predictive maintenance alerts.',
        targetPlatforms: ['Web'],
      },
      status: 'Analyzed' as const,
      dna: {
        competitors: ['Samsara', 'Geotab', 'Motive'],
        references: [
          {
            name: 'Samsara Fleet UI',
            url: 'https://samsara.com',
            notes: 'Benchmark for telematics data density and dark map styling',
          },
          {
            name: 'FlightAware Tracker',
            url: 'https://flightaware.com',
            notes: 'High-frequency telemetry rendering model',
          },
        ],
        persistentInstructions: 'Prioritize low data latency and battery optimization for vehicle IoT ingestion pipelines. Enforce high-contrast dark mode for dispatch centers.',
      },
      brand: {
        personality: ['Reliable', 'Industrial', 'Mission-Critical'],
        colors: [
          { hex: '#0f172a', role: 'Dashboard Base', source: 'client' as const },
          { hex: '#ea580c', role: 'Alert Accent', source: 'client' as const },
          { hex: '#22c55e', role: 'Online Fleet Status', source: 'ai' as const },
        ],
        typography: ['Roboto Mono', 'Inter'],
        visualStyle: 'High-density telemetry dashboard with vector map visualization',
        tone: 'Precise, urgent, and operational',
      },
      product: {
        objective: 'Reduce fleet operational downtime and optimize delivery route dispatching.',
        targetUsers: ['Fleet Dispatchers', 'Maintenance Supervisors', 'Logistics Directors'],
        userJourneys: ['Live Vehicle Map -> Alert Trigger -> Remote Engine Diagnostic -> Service Dispatch'],
        coreFeatures: ['Real-Time GPS Vehicle Tracking', 'CAN-Bus Diagnostic Sensor Ingestion', 'Geofence Breach Alerts'],
        successMetrics: ['15% reduction in fleet fuel consumption', '20% decrease in unscheduled vehicle downtime'],
      },
      guardrails: {
        always: [
          { id: 'g-always-1', text: 'Ensure live telemetry map updates smoothly at 60fps without freezing', source: 'client' as const },
          { id: 'g-always-2', text: 'Cache offline vehicle locations locally on cellular network drop', source: 'ai' as const },
        ],
        never: [
          { id: 'g-never-1', text: 'Block dispatcher UI interactions while polling device signals', source: 'client' as const },
          { id: 'g-never-2', text: 'Expose unencrypted GPS coordinates in public payloads', source: 'human_edited' as const },
        ],
      },
      aiAnalysis: {
        summary: 'Heavy real-time data visualization required with resilient IoT device ingestion pipelines.',
        modules: ['Live Map Telemetry', 'Alerts & Diagnostics', 'Maintenance Scheduler', 'Fleet Reporting'],
        risks: ['WebSocket scale under peak fleet shift hours', 'Network loss in remote delivery corridors'],
        clarificationQuestions: ['What is the expected sensor tick rate per vehicle?'],
        complexity: 'High' as const,
      },
      prd: {
        sections: [
          {
            title: '1. Executive Summary',
            content: 'Provide a real-time web portal for dispatchers to supervise 500+ delivery vehicles across regional routes.',
          },
          {
            title: '2. Functional Requirements',
            content: '- 1-second geolocation updates\n- CAN-bus engine error code alerts\n- Historical playback scrubber',
          },
        ],
      },
      technicalPlan: {
        frontend: {
          recommendation: 'React with Mapbox GL',
          rationale: 'High performance WebGL vector tile rendering for thousands of simultaneous vehicle markers.',
          isApproved: true,
        },
        backend: {
          recommendation: 'Node.js Fastify with WebSockets',
          rationale: 'Low-latency binary ingestion with low memory overhead for high-frequency telemetry ticks.',
          isApproved: false,
        },
        database: {
          recommendation: 'MongoDB Time Series Collections',
          rationale: 'Native time-series indexing and automated bucket compression optimized for sensor telemetry.',
          isApproved: true,
        },
        auth: {
          recommendation: 'Okta Enterprise SSO',
          rationale: 'Role-based access controls and SAML 2.0 integration for enterprise fleet operators.',
          isApproved: false,
        },
        infrastructure: {
          recommendation: 'AWS ECS Fargate',
          rationale: 'Containerized elastic scaling for variable vehicle shift loads with auto-recovery.',
          isApproved: false,
        },
        integrations: [
          {
            name: 'HERE Routing API',
            rationale: 'Commercial truck routing with bridge height, weight restrictions, and hazmat compliance.',
            isApproved: true,
          },
        ],
      },
      tasks: [
        {
          id: 'TASK-1',
          epic: 'Telemetry',
          title: 'Implement WebSocket Telemetry Ingestion Hub',
          ownerRole: 'Backend Eng',
          priority: 'High',
          estimateDays: 3,
          status: 'In Progress' as const,
        },
        {
          id: 'TASK-2',
          epic: 'Map UI',
          title: 'Configure Mapbox GL Vector Cluster Layer',
          ownerRole: 'Frontend Eng',
          priority: 'High',
          estimateDays: 4,
          status: 'Todo' as const,
        },
      ],
    },
    {
      basicInfo: {
        name: 'Zeta Flow Engine',
        clientName: 'Zeta Tech',
        description: 'Internal workflow builder and automation runner for human resources onboarding and audit compliance.',
        targetPlatforms: ['Web'],
      },
      status: 'Draft' as const,
      dna: {
        competitors: ['Zapier', 'Workato', 'Make.com'],
        references: [
          {
            name: 'Retool Workflows',
            url: 'https://retool.com',
            notes: 'Node-based drag and drop canvas UI pattern',
          },
        ],
        persistentInstructions: 'Self-hosted deployment capability required with air-gapped audit logging and compliance export.',
      },
      brand: {
        personality: ['Clean', 'Structured', 'Trustworthy'],
        colors: [
          { hex: '#1e293b', role: 'Canvas Background', source: 'client' as const },
          { hex: '#3b82f6', role: 'Node Primary', source: 'ai' as const },
        ],
        typography: ['Inter'],
        visualStyle: 'Minimalist flowchart canvas with clean node connectors',
        tone: 'Direct and developer-friendly',
      },
      product: {
        objective: 'Eliminate manual HR onboarding checklists and automate multi-system employee provisioning.',
        targetUsers: ['HR Operations Managers', 'IT Systems Administrators'],
        userJourneys: ['Draft Flow -> Connect Google Workspace -> Test Run -> Publish'],
        coreFeatures: ['Visual DAG Workflow Canvas', 'Approval Gate Triggers', 'Audit Log Trail'],
        successMetrics: ['Reduce employee onboarding provisioning time from 3 days to 15 minutes'],
      },
      guardrails: {
        always: [
          { id: 'g-always-1', text: 'Require two-factor approval for any employee offboarding action', source: 'client' as const },
        ],
        never: [
          { id: 'g-never-1', text: 'Execute unvalidated custom script steps on main orchestration thread', source: 'human_edited' as const },
        ],
      },
      technicalPlan: {
        frontend: {
          recommendation: 'Next.js with React Flow',
          rationale: 'Interactive node-based canvas with customizable drag-and-drop connectors.',
          isApproved: false,
        },
        backend: {
          recommendation: 'Temporal.io or BullMQ Engine',
          rationale: 'Durable distributed task orchestration with automatic retry mechanics.',
          isApproved: false,
        },
        database: {
          recommendation: 'MongoDB Atlas',
          rationale: 'Document model represents complex workflow state trees with nested conditional branches.',
          isApproved: false,
        },
        auth: {
          recommendation: 'Google Workspace OAuth',
          rationale: 'Corporate single sign-on with direct identity mapping.',
          isApproved: false,
        },
        infrastructure: {
          recommendation: 'Kubernetes or Docker Compose',
          rationale: 'Flexible hybrid on-premises or cloud container hosting.',
          isApproved: false,
        },
        integrations: [
          {
            name: 'Slack Webhooks',
            rationale: 'Real-time approval requests and notification broadcasts.',
            isApproved: false,
          },
        ],
      },
      tasks: [],
    },
  ];

  for (const p of projects) {
    const score = calculateReadiness(p);
    await Project.create({ ...p, readinessScore: score });
  }

  console.log('Database seeded successfully with Project DNA, Provenance, and Technical Decisions');
  await mongoose.disconnect();
}

seed().catch(console.error);
