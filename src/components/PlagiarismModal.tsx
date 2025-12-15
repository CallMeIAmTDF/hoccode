import {AlertTriangle, FileCode, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {useEffect} from "react";

interface PlagiarismSourceLine {
    color: string;
    code: string;
}

interface PlagiarismFile {
    filename: string;
    source: PlagiarismSourceLine[];
}

interface PlagiarismMatch {
    file1: PlagiarismFile;
    file2: PlagiarismFile;
    lines: number;
}

interface PlagiarismResult {
    matches: PlagiarismMatch[];
}

interface PlagiarismModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PlagiarismResult | null;
    loading: boolean;
    selectedMatch: PlagiarismMatch | null;
    onSelectMatch: (match: PlagiarismMatch | null) => void;
}

const PlagiarismModal: React.FC<PlagiarismModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             data,
                                                             loading,
                                                             selectedMatch,
                                                             onSelectMatch
                                                         }) => {
    if (!isOpen) return null;

    const parseFilename = (filename: string) => {
        // Hỗ trợ dấu \ hoặc /, có hoặc không có __tdf__, và có thể có khoảng trắng trong title
        const match = filename.match(
            /contest_(\d+)[\\/]+problem_(\d+)(?:__tdf__(.+?))?[\\/]+(\w+)[\\/]+(.+?)\s*\((\d+)%\)/i
        );

        console.log({
            match,
            filename,
        });

        if (match) {
            return {
                contest: match[1],
                problemId: match[2],
                problem: match[3]?.trim() || null,
                language: match[4],
                username: match[5].replace(/\.\w+$/, ''),
                similarity: match[6]
            };
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
            <div
                className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] min-h-[70vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600"/>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Kết quả kiểm tra gian lận</h2>
                                <p className="text-sm text-slate-600">
                                    {loading
                                        ? "Đang phân tích..."
                                        : `Tìm thấy ${data?.matches.length || 0} cặp code nghi ngờ`}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center flex-1">
                            <div className="text-center">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Đang kiểm tra gian lận...</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`flex-1 grid transition-all duration-300 min-h-0 ${
                                selectedMatch ? "grid-cols-3" : "grid-cols-1"
                            }`}
                        >
                            {/* Matches List */}
                            {
                                data?.matches.length == 0 ? (
                                    <div className="flex items-center justify-center flex-1">
                                        Không tồn tại gian lận
                                    </div>
                                ) : (
                                    <div
                                        className={`border-r border-slate-200 flex flex-col min-h-0 ${
                                            selectedMatch ? "col-span-1" : "col-span-1"
                                        }`}
                                    >
                                        <div className="p-4 border-b border-slate-200 flex-shrink-0">
                                            <h3 className="text-sm font-semibold text-slate-900">Danh sách trùng
                                                khớp</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0  no-scrollbar">
                                            {data?.matches.map((match, index) => {
                                                const file1Info = parseFilename(match.file1.filename);
                                                const file2Info = parseFilename(match.file2.filename);
                                                const isSelected = selectedMatch === match;

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => onSelectMatch(match)}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                                            isSelected
                                                                ? "border-red-400 bg-red-50"
                                                                : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <FileCode className="w-4 h-4 text-red-600"/>
                                                                <span className="text-sm font-semibold text-slate-900">
                                                    {file1Info?.username.split('@')[0]}
                                                </span>
                                                                <span className="text-slate-400">vs</span>
                                                                <span className="text-sm font-semibold text-slate-900">
                                                    {file2Info?.username.split('@')[0]}
                                                </span>
                                                            </div>
                                                            <Badge className="bg-red-100 text-red-700 text-xs">
                                                                {file1Info?.similarity}% trùng
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-600">
                                                    {file1Info?.problem}
                                                </span>
                                                                <span className="text-slate-400">•</span>
                                                                <Badge className="text-xs">
                                                                    {file1Info?.language}
                                                                </Badge>
                                                            </div>

                                                            <div className="text-xs text-slate-500">
                                                                {match.lines} dòng code trùng khớp
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            }

                            {/* Code Comparison */}
                            {selectedMatch && (
                                <div className="col-span-2 flex flex-col overflow-hidden min-h-0">
                                    <div className="p-4 border-b border-slate-200 flex-shrink-0">
                                        <h3 className="text-sm font-semibold text-slate-900">So sánh code</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                        <div className="grid grid-cols-2 gap-4 h-full">
                                            {/* File 1 */}
                                            <div className="flex flex-col h-full min-h-0">
                                                <div className="mb-3 p-3 bg-slate-100 rounded-lg flex-shrink-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileCode className="w-4 h-4 text-slate-600"/>
                                                        <span className="font-semibold text-slate-900">
                                {parseFilename(selectedMatch.file1.filename)?.username.split('@')[0]}
                            </span>
                                                    </div>
                                                    <div className="text-xs text-slate-600">
                                                        <div>
                                                            Thử thách:{" "}
                                                            {parseFilename(selectedMatch.file1.filename)?.problem}
                                                        </div>
                                                        <div>
                                                            Ngôn ngữ:{" "}
                                                            {parseFilename(selectedMatch.file1.filename)?.language}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex-1 bg-slate-900 rounded-lg overflow-hidden min-h-0 max-h-[45vh]">
                        <pre className="h-full p-4 text-sm overflow-auto">
                            <code className="block leading-relaxed">
                                {selectedMatch.file1.source.map((line, idx) => (
                                    <div
                                        key={idx}
                                        className="mb-1 last:mb-0"
                                        style={{
                                            backgroundColor:
                                                line.color === "#FF0000"
                                                    ? "rgba(239, 68, 68, 0.2)"
                                                    : line.color === "#FFFF00"
                                                        ? "rgba(234, 179, 8, 0.2)"
                                                        : "transparent",
                                            color: "#f1f5f9",
                                            padding: "2px 0",
                                        }}
                                    >
                                        {line.code}
                                    </div>
                                ))}
                            </code>
                        </pre>
                                                </div>
                                            </div>

                                            {/* File 2 */}
                                            <div className="flex flex-col h-full min-h-0">
                                                <div className="mb-3 p-3 bg-slate-100 rounded-lg flex-shrink-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileCode className="w-4 h-4 text-slate-600"/>
                                                        <span className="font-semibold text-slate-900">
                                {parseFilename(selectedMatch.file2.filename)?.username.split('@')[0]}
                            </span>
                                                    </div>
                                                    <div className="text-xs text-slate-600">
                                                        <div>
                                                            Thử thách:{" "}
                                                            {parseFilename(selectedMatch.file2.filename)?.problem}
                                                        </div>
                                                        <div>
                                                            Ngôn ngữ:{" "}
                                                            {parseFilename(selectedMatch.file2.filename)?.language}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden min-h-0 max-h-[45vh]">
                        <pre className="h-full p-4 text-sm overflow-auto">
                            <code className="block leading-relaxed">
                                {selectedMatch.file2.source.map((line, idx) => (
                                    <div
                                        key={idx}
                                        className="mb-1 last:mb-0"
                                        style={{
                                            backgroundColor:
                                                line.color === "#FF0000"
                                                    ? "rgba(239, 68, 68, 0.2)"
                                                    : line.color === "#FFFF00"
                                                        ? "rgba(234, 179, 8, 0.2)"
                                                        : "transparent",
                                            color: "#f1f5f9",
                                            padding: "2px 0",
                                        }}
                                    >
                                        {line.code}
                                    </div>
                                ))}
                            </code>
                        </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlagiarismModal;