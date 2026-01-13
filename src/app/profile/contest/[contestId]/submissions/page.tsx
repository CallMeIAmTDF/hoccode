import SubmissionHistory from "@/app/profile/contest/[contestId]/submissions/SubmissionHistory";

export default function Page() {
    return <SubmissionHistory />;
}

export function generateStaticParams() {
    return [];
}