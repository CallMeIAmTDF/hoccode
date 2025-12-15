import { Skeleton } from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface ProblemListSkeletonProps {
    rows?: number;
}

export function ProblemListSkeleton({ rows = 5 }: ProblemListSkeletonProps) {
    return (
        <div className="space-y-4">
            {/* Skeleton cho filters */}
            <div className="flex gap-2">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-20 rounded-md" />
            </div>

            {/* Skeleton cho bảng */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Thử thách</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead className="text-center">Điểm thưởng</TableHead>
                            <TableHead className="text-center">Giới hạn</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rows }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-48" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-16 rounded-md" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-24 rounded-md" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-5 w-10 mx-auto" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
