import {Solution} from "@/lib/types/solution";

export type ProcessedSolution = Solution & { tabName: string; key: string };

export const processSolutions = (solutions: Solution[]): ProcessedSolution[] => {
    const grouped: { [key: string]: Solution[] } = solutions.reduce((acc, solution) => {
        const key = solution.language;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(solution);
        return acc;
    }, {} as { [key: string]: Solution[] });

    const processedSolutions: ProcessedSolution[] = [];

    Object.keys(grouped)
        .sort()
        .forEach(language => {
            grouped[language].forEach((solution, index) => {
                const tabName = `${language}_${index + 1}`;
                processedSolutions.push({
                    ...solution,
                    tabName: tabName,
                    key: tabName, // Dùng tabName làm key cho Tabs
                });
            });
        });

    return processedSolutions;
};

// Hàm ánh xạ ngôn ngữ cho Monaco
export const getMonacoLanguage = (language: string): string => {
    const lowerCaseLang = language.toLowerCase();
    if (lowerCaseLang.includes('java')) return 'java';
    if (lowerCaseLang.includes('c++') || lowerCaseLang.includes('cpp')) return 'cpp';
    if (lowerCaseLang.includes('python')) return 'python';
    if (lowerCaseLang.includes('javascript') || lowerCaseLang.includes('js')) return 'javascript';
    if (lowerCaseLang.includes('typescript') || lowerCaseLang.includes('ts')) return 'typescript';
    return 'plaintext';
};