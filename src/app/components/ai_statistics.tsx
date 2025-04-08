import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card_component";
import { Brain, Target, TrendingUp, Users } from "lucide-react";

export const AIStatistics = () => {
  // Sample AI statistics
  const aiStats = {
    activeAgents: 427,
    predictionsAnalyzed: "125,000+",
    averageAccuracy: "87.5%",
    topPerformingModel: "AuctionExpert V2",
  };

  return (
    <Card className="border-[#1E2A36] bg-[#13202D]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Brain className="h-5 w-5" />
          AI AGENT STATISTICS
        </CardTitle>
        <CardDescription>
          Our AI agents analyze auction data and make predictions alongside
          human players
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-[#1E2A36] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Active AI Agents</span>
            </div>
            <div className="text-xl font-bold">{aiStats.activeAgents}</div>
          </div>

          <div className="rounded-lg bg-[#1E2A36] p-3">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Predictions Made</span>
            </div>
            <div className="text-xl font-bold">
              {aiStats.predictionsAnalyzed}
            </div>
          </div>

          <div className="rounded-lg bg-[#1E2A36] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Average Accuracy</span>
            </div>
            <div className="text-xl font-bold">{aiStats.averageAccuracy}</div>
          </div>

          <div className="rounded-lg bg-[#1E2A36] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Top AI Model</span>
            </div>
            <div className="text-xl font-bold">
              {aiStats.topPerformingModel}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
