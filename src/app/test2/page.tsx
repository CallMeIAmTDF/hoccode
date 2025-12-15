"use client"

import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import {Select} from "@/components/ui/select";
import {AIAnalysis, AnalysisReportData, UserStatsData} from "@/lib/types/profile";
import UserStatsModal from "@/app/test2/UserStatsModal";
import {AnalysisReportModal} from "@/components/AIAccountAnalysisModal";

const MonacoEditorComponent = dynamic(() => import("@/components/hoccodeeditor"), {ssr: false});
export default function HomePage() {
    const data : UserStatsData = {
        "submissionSummary": {
            "passedSubmissions": 66,
            "failedSubmissions": 32
        },
        "dailyTimeSlotAnalysis": {
            "MORNING": 33,
            "EVENING": 45,
            "AFTERNOON": 20
        },
        "dayOfWeekAnalysis": {
            "busiestDay": "FRIDAY",
            "busiestTimeSlot": "EVENING"
        },
        "categorySubmissionCount": {
            "SLIDING_WINDOW": 1,
            "HASH_TABLE": 1,
            "STRING": 2,
            "TWO_POINTERS": 1,
            "MATH": 3,
            "GREEDY": 1,
            "BIT_MANIPULATION": 1
        },
        "languageSubmissionSummary": {
            "python": {
                "passed": 63,
                "failed": 19,
                "total": 82
            },
            "java": {
                "passed": 3,
                "failed": 13,
                "total": 16
            },
            "cpp": {
                "passed": 3,
                "failed": 13,
                "total": 16
            }
        },
        "stats": {
            "rank": 1,
            "point": 700,
            "joined": "2025-08-31T21:51:07"
        }
    }

    const data2 : UserStatsData = {
        "submissionSummary": {
            "passedSubmissions": 0,
            "failedSubmissions": 0
        },
        "dailyTimeSlotAnalysis": {},
        "dayOfWeekAnalysis": {
            "busiestDay": "N/A",
            "busiestTimeSlot": "N/A"
        },
        "categorySubmissionCount": {},
        "languageSubmissionSummary": {},
        "stats": {
            "rank": 3,
            "point": 0,
            "joined": "2025-08-28T02:34:04"
        }
    }
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [openAIModal, setOpenAIModal] = useState<boolean>(false);
    const [aiModalLoading, setAIModalLoading] = useState<boolean>(true);
    const [aiData, setAIData] = useState<AIAnalysis | null>(null)


    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000)
    }, [])

    const aiDataFull : AnalysisReportData = {
        "overview": {
            "totalSubmissions": 98,
            "passRateDescription": "66 lần nộp đã đạt thành công trong tổng số 98 lần nộp.",
            "dominantLanguage": "python",
            "strongestCategory": "MATH",
            "activeTimeSlot": "EVENING",
            "activeDay": "FRIDAY"
        },
        "insights": {
            "studyHabits": "Bạn thường xuyên nộp bài vào buổi tối, nhất là vào các ngày thứ Năm. Số lượng nộp cao trong khung giờ này cho thấy bạn đã tạo ra thói quen tập trung vào thời gian tối.",
            "languageAnalysis": "Python chiếm phần lớn trong tổng số nộp, với 82 lần và 63 lần thành công. Java lại có ít hơn 20 lần nộp và tỷ lệ thất bại cao, chỉ có 3 lần thành công.",
            "categoryAnalysis": "MATH là lĩnh vực mạnh nhất của bạn với 3 lần nộp. Các chủ đề khác như SLIDING_WINDOW, HASH_TABLE, TWO_POINTERS, GREEDY, BIT_MANIPULATION chỉ được nộp một lần mỗi thứ, cho thấy bạn chưa tập trung vào chúng.",
            "behaviorPrediction": "Bạn có xu hướng làm việc vào buổi tối, ưu tiên Python và thể loại MATH. Khi gặp thử thách mới, bạn có thể cần thời gian ôn tập thêm, đặc biệt là với Java và các chủ đề ít nộp."
        },
        "highlights": [
            "Đạt 66 lần thành công trong tổng 98 lần nộp.",
            "Đứng đầu bảng xếp hạng với 700 điểm.",
            "Mặc dù ít nộp Java, bạn vẫn có 3 lần thành công."
        ],
        "achievementScore": {
            "consistency": "độ nhất quán cao, thường xuyên nộp trong các thời gian nhất định.",
            "problemSolving": "kết quả tốt trong các bài toán MATH và Python.",
            "languageMastery": "đánh giá cao với Python; cần cải thiện với Java.",
            "overall": "đạt thành tích ấn tượng, nhưng còn cơ hội phát triển thêm."
        },
        "funFacts": [
            "Bạn đã tham gia vào hệ thống từ ngày 31/08/2025.",
            "Bạn đang giữ vị trí số 1 trong bảng xếp hạng hiện tại."
        ],
        "improvementSuggestions": {
            "weakCategories": "Bạn có thể luyện tập thêm các chủ đề như SLIDING_WINDOW, HASH_TABLE, TWO_POINTERS, GREEDY, BIT_MANIPULATION để mở rộng phạm vi kỹ năng.",
            "languageGrowth": "Java có số lượng failed cao; hãy dành thời gian ôn lại các khái niệm nền tảng của Java để cải thiện hiệu suất.",
            "timeOptimization": "Bởi vì bạn hoạt động mạnh vào buổi tối, hãy tận dụng thời gian này để thử các bài tập khó hơn hoặc các chủ đề nâng cao.",
            "skillExpansion": "Bạn có thể mở rộng sang các chủ đề như GRAPH hoặc DYNAMIC_PROGRAMMING để nâng cấp tư duy thuật toán."
        }
    }

    const aiDataMiss1 : AnalysisReportData = {
        "overview": {
            "totalSubmissions": null,
            "passRateDescription": null,
            "dominantLanguage": null,
            "strongestCategory": null,
            "activeTimeSlot": null,
            "activeDay": null
        },
        "insights": {
            "studyHabits": null,
            "languageAnalysis": null,
            "categoryAnalysis": null,
            "behaviorPrediction": null
        },
        "highlights": [],
        "achievementScore": {
            "consistency": null,
            "problemSolving": null,
            "languageMastery": null,
            "overall": null
        },
        "funFacts": [],
        "improvementSuggestions": {
            "weakCategories": null,
            "languageGrowth": null,
            "timeOptimization": null,
            "skillExpansion": null
        }
    }

    const aiDataMiss2 : AnalysisReportData = {
        "overview": null,
        "insights": null,
        "highlights": null,
        "achievementScore": null,
        "funFacts": null,
        "improvementSuggestions": null
    }

    const handleAnalysisAI = async () => {
        setOpenAIModal(true);
        setOpen(false);
        setTimeout(() => {
            setAIModalLoading(false);
            setAIData(
                aiDataFull
            )
        }, 10000)
    }

    return (
        <>
            <UserStatsModal loading={loading} open={open} onOpenChange={setOpen} data={data} onAnalyzeWithAI={handleAnalysisAI}></UserStatsModal>
            {/*<AIAccountAnalysisModal open={openAIModal} loading={aiModalLoading} onOpenChange={setOpenAIModal} data={aiData} />*/}
            <AnalysisReportModal data={aiData} onClose={() => {setOpenAIModal(false)}} isLoading={aiModalLoading} isOpen={openAIModal}/>

        </>
    );
}