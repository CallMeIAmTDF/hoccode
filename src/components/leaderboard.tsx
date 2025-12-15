import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

interface User {
    id: string
    point: number
    avatar: string
    name: string
}

interface LeaderboardProps {
    users: User[]
}

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1:
            return <Trophy className="h-4 w-4 text-yellow-500" />
        case 2:
            return <Medal className="h-4 w-4 text-gray-400" />
        case 3:
            return <Award className="h-4 w-4 text-amber-600" />
        default:
            return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
}

const getPointsBadgeColor = (points: number) => {
    if (points >= 2500) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    if (points >= 2000) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    if (points >= 1500) return "bg-green-100 text-green-800 hover:bg-green-100"
    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
}

export function Leaderboard({ users }: LeaderboardProps) {
    return (
        <Card className="h-fit min-h-[330px] gap-1">
            <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-700" />
                    Bảng xếp hạng
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {users.map((user, index) => {
                    const rank = index + 1
                    return (
                        <div
                            key={user.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center justify-center w-6">
                                {getRankIcon(rank)}
                            </div>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="text-xs">
                                    {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">
                                    {user.name}
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${getPointsBadgeColor(user.point)}`}
                                >
                                    {user.point.toLocaleString()} pts
                                </Badge>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
