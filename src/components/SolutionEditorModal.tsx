import {createContext, useContext, useEffect, useState} from "react";
import {CreateSolutionRequest, mockSolutions, Solution} from "@/lib/types/solution";
import {AdminProblem} from "@/lib/types/problem";
import {notify} from "@/components/notify";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Code, Save} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {apiGet, apiPost, apiPut} from "@/lib/api";
import MonacoEditorComponent from "@/components/hoccodeeditor";

interface SolutionContextType {
    solutions: Solution[];
    currentProblem: AdminProblem | null;
    isModalOpen: boolean;
    editingSolution: Solution | null;
    openModal: (problem: AdminProblem, solution?: Solution) => void;
    closeModal: () => void;
    saveSolution: (data: Partial<Solution>) => void;
    deleteSolution: (id: number) => void;
}

const SolutionContext = createContext<SolutionContextType | undefined>(undefined);

export const SolutionProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [solutions, setSolutions] = useState<Solution[]>(mockSolutions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<AdminProblem | null>(null);
    const [editingSolution, setEditingSolution] = useState<Solution | null>(null);



    const openModal = (problem: AdminProblem, solution?: Solution) => {
        setCurrentProblem(problem);
        setEditingSolution(solution || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProblem(null);
        setEditingSolution(null);
    };

    const saveSolution = async (data: Partial<Solution>) => {
        if (!currentProblem) return;

        if (editingSolution) {
            try {
                const body: CreateSolutionRequest = {
                    pid: editingSolution.id,
                    language: data.language || "__tdf__",
                    code: data.code || "__tdf__",
                    time: data.time || "__tdf__",
                    space: data.space || "__tdf__",
                    note: data.note || "__tdf__",
                }
                const api = apiPut<Solution>(`/solution/${editingSolution.id}`, body);
                setSolutions(prev => prev.map(s =>
                    s.id === editingSolution.id
                        ? {...s, ...api}
                        : s
                ));
                notify("success", {title: "Thành công", description: "Cập nhật solution thành công"});
                closeModal();
            } catch (err: any) {
                notify("success", {title: "Thất bại", description: "Cập nhật solution thất bại"});
            }
        } else {
            const body: CreateSolutionRequest = {
                pid: currentProblem.id,
                language: data.language || "CPP",
                code: data.code || "",
                time: data.time || "",
                space: data.space || "",
                note: data.note || "",
            }
            try {
                const newSol = await apiPost<Solution>(`/solution`, body)
                setSolutions(prev => [...prev, newSol]);
                notify("success", {title: "Thành công", description: "Thêm solution thành công"});
                closeModal();
            } catch (err: any) {
                notify("error", {title: "Thất bại", description: "Thêm solution thất bại"});
            }
        }
    };

    const deleteSolution = async (id: number) => {
        try {
            const _ = await apiPost<Solution>(`/solution/${id}`, {});
            setSolutions(prev => prev.filter(s => s.id !== id));
            notify("success", {title: "Đã xóa", description: "Xóa solution thành công"});
        } catch (err: any) {
            notify("error", {title: "Thất bại", description: "Xoá solution thất bại"});
        }
    };

    return (
        <SolutionContext.Provider value={{
            solutions, currentProblem, isModalOpen, editingSolution,
            openModal, closeModal, saveSolution, deleteSolution
        }}>
            {children}
        </SolutionContext.Provider>
    );
};

export const useSolution = () => {
    const ctx = useContext(SolutionContext);
    if (!ctx) throw new Error("useSolution must be used within SolutionProvider");
    return ctx;
};


export const SolutionEditorModal: React.FC = () => {
    const {
        isModalOpen, currentProblem, editingSolution,
        closeModal, saveSolution
    } = useSolution();

    const [form, setForm] = useState({
        language: editingSolution?.language || "CPP",
        code: editingSolution?.code || "",
        time: editingSolution?.time || "",
        space: editingSolution?.space || "",
        note: editingSolution?.note || "",
    });

    const languages = ["CPP", "JAVA", "PYTHON"];

    useEffect(() => {
        if (editingSolution) {
            setForm({
                language: editingSolution.language,
                code: editingSolution.code,
                time: editingSolution.time,
                space: editingSolution.space,
                note: editingSolution.note,
            });
        } else {
            setForm({language: "CPP", code: "", time: "", space: "", note: ""});
        }
    }, [editingSolution, isModalOpen]);

    if (!isModalOpen || !currentProblem) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6 min-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {/*<Code className="w-6 h-6 text-green-600"/>*/}
                        {editingSolution ? "Chỉnh sửa Lời giải" : "Thêm Lời giải mới"} - #{currentProblem.id} {currentProblem.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="space-y-2">
                            <Label>Ngôn ngữ</Label>
                            <Select value={form.language}
                                    onValueChange={v => setForm(prev => ({...prev, language: v}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Time Complexity</Label>
                            <Input placeholder="O(n)" value={form.time}
                                   onChange={e => setForm(prev => ({...prev, time: e.target.value}))}/>
                        </div>

                        <div className="space-y-2">
                            <Label>Space Complexity</Label>
                            <Input placeholder="O(1)" value={form.space}
                                   onChange={e => setForm(prev => ({...prev, space: e.target.value}))}/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Mã nguồn</Label>
                        <div className="h-[400px] border rounded-md overflow-hidden">
                            <MonacoEditorComponent
                                height="100%"
                                language={form.language.toLowerCase()}
                                value={form.code}
                                onChange={(v) => setForm(prev => ({...prev, code: v ?? ""}))}
                                options={{
                                    fontSize: 14,
                                    minimap: {enabled: false},
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ghi chú (giải thích ý tưởng)</Label>
                        <Textarea
                            rows={4}
                            className="text-sm"
                            value={form.note}
                            onChange={e => setForm(prev => ({...prev, note: e.target.value}))}
                            placeholder="Mô tả cách tiếp cận, ý tưởng chính..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={closeModal}>Hủy</Button>
                    <Button onClick={() => saveSolution(form)} className="bg-green-600 hover:bg-green-700">
                        {editingSolution ? "Cập nhật" : "Thêm Lời giải"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};