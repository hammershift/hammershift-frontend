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
            <Card className="h-full cursor-pointer border-white/[0.08] bg-[#16181f] transition-colors hover:border-[#E94560]">
                <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E94560]/10">
                        <Icon className="h-6 w-6 text-[#E94560]" />
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-xl font-bold">{title}</h3>
                        {/* {badgeText && (
                            <Badge
                                variant="outline"
                                className="border border-[#E94560]/40 bg-[#E94560]/20 text-[#E94560]"
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
