import { Trophy, ArrowRight, Users } from "lucide-react";
import { Button } from "./button";
import { Card, CardHeader, CardContent } from "./card_component";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export const Leaderboard = () => {
  const topPlayers = [
    {
      username: "CarMaster",
      avatar: "M",
      winRate: 78,
      earnings: 12500,
      points: 500,
    },
    {
      username: "SpeedDemon",
      avatar: "S",
      winRate: 75,
      earnings: 10200,
      points: 450,
    },
    {
      username: "AutoExpert",
      avatar: "A",
      winRate: 72,
      earnings: 9800,
      points: 400,
    },
    {
      username: "RallyKing",
      avatar: "R",
      winRate: 70,
      earnings: 8900,
      points: 350,
    },
    {
      username: "DriftQueen",
      avatar: "D",
      winRate: 68,
      earnings: 8500,
      points: 300,
    },
  ];

  return (
    <section className="mx-auto py-12">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#1E2A36] bg-[#13202D]">
          <CardHeader className="pb-3">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Trophy className="text-[#F2CA16]" />
              WEEKLY WINNER
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F2CA16]/20">
                  <Trophy className="h-10 w-10 text-[#F2CA16]" />
                </div>
                <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F2CA16] font-bold text-[#0C1924]">
                  1
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {topPlayers[0].username}
                </div>
                <div className="text-gray-400">
                  Win Rate: {topPlayers[0].winRate}%
                </div>
                <div className="font-bold text-[#F2CA16]">
                  ${topPlayers[0].earnings.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1E2A36] bg-[#13202D]">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Users className="text-[#F2CA16]" />
              TOP PLAYERS
            </h3>
            <Button variant="link" className="text-[#F2CA16]">
              VIEW ALL
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlayers.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            index === 0
                              ? "bg-[#F2CA16] text-[#0C1924]"
                              : index === 1
                                ? "bg-gray-300 text-[#0C1924]"
                                : index === 2
                                  ? "bg-[#cd7f32] text-[#0C1924]"
                                  : "bg-[#1E2A36] text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {player.username}
                      </div>
                    </TableCell>
                    <TableCell>{player.winRate}%</TableCell>
                    <TableCell className="text-right">
                      ${player.earnings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
