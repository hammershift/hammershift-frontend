import Link from "next/link";
import { Button } from "./ui/button";
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
        <Link href={link} className={`${title != "FREE PLAY MODE" ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={title != "FREE PLAY MODE"}>
            <Card className="h-full cursor-pointer border-[#1E2A36] bg-[#13202D] transition-colors hover:border-[#F2CA16]">
                <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F2CA16]/10">
                        <Icon className="h-6 w-6 text-[#F2CA16]" />
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-xl font-bold">{title}</h3>
                        {/* {badgeText && (
                            <Badge
                                variant="outline"
                                className="border border-[#F2CA16]/40 bg-[#F2CA16]/20 text-[#F2CA16]"
                            >
                                {badgeText}
                            </Badge>
                        )} */}
                    </div>
                    <p className="mb-4 text-gray-300">{description}</p>
                    {/* <div className="flex items-center text-sm text-gray-400">
                        <Users className="mr-1 h-4 w-4" />
                        {playerCount?.toLocaleString()} Players
                    </div> */}
                </CardContent>
            </Card>
        </Link>
    );
};
