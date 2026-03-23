import { Metadata } from 'next';
import VelocityAgentDashboard from './VelocityAgentDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Velocity Agent | AI Price Predictions',
  description:
    'Track the Velocity Agent — an autonomous AI that predicts auction outcomes. See accuracy stats, grade distribution, and recent predictions.',
  openGraph: {
    title: 'Velocity Agent | AI Price Predictions',
    description: 'Autonomous AI auction price predictions with live accuracy tracking.',
  },
};

export default function VelocityAgentPage() {
  return <VelocityAgentDashboard />;
}
