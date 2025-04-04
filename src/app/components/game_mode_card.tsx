import Link from "next/link";
import { Button } from "./button";
import { Icon, LucideIcon } from "lucide-react";
import { Users } from "lucide-react";
import { Card, CardContent } from "./card_component";
import { Badge } from "./badge";
interface IProps {
  title: string;
  description: string;
  icon: LucideIcon;
  playerCount?: number;
  link: string;
  badgeText?: string;
}
export const GameModeCard = ({
  title,
  description,
  icon: Icon,
  playerCount,
  link,
  badgeText,
}: IProps) => {
  return (
    <Link href="/">
      <Card className="bg-[#13202D] border-[#1E2A36] hover:border-[#F2CA16] transition-colors cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className="w-12 h-12 rounded-full bg-[#F2CA16]/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[#F2CA16]" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-xl">{title}</h3>
            {badgeText && (
              <Badge
                variant="outline"
                className="bg-[#F2CA16]/20 text-[#F2CA16] border border-[#F2CA16]/40"
              >
                {badgeText}
              </Badge>
            )}
          </div>
          <p className="text-gray-300 mb-4">{description}</p>
          <div className="flex items-center text-sm text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            {playerCount?.toLocaleString()} Players
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
