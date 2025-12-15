"use client"

import React, { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {Spinner} from "@/components/ui/shadcn-io/spinner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false, loading: () => <div className="flex justify-center items-center w-full h-full"><Spinner/></div>,
})

type Props = {
    value: string
    language?: string
    height?: string
    onChange?: (v: string | undefined) => void
    options?: any
}

// ============ CODE ANALYZER ============
class CodeAnalyzer {
    variables = new Map()
    functions = new Map()
    classes = new Map()

    analyze(code: string, language: string) {
        this.variables.clear()
        this.functions.clear()
        this.classes.clear()

        switch(language) {
            case 'cpp':
                this.analyzeCpp(code)
                break
            case 'java':
                this.analyzeJava(code)
                break
            case 'python':
                this.analyzePython(code)
                break
        }
    }

    analyzeCpp(code: string) {
        // Phân tích biến C++
        const varPatterns = [
            /(?:int|float|double|char|string|bool|long|short|void)\s+(\w+)/g,
            /(?:std::)?(?:string|vector|map|set|queue|stack|deque|list)(?:<[^>]+>)?\s+(\w+)/g,
            /auto\s+(\w+)\s*=/g
        ]

        varPatterns.forEach(pattern => {
            let match
            while ((match = pattern.exec(code)) !== null) {
                this.variables.set(match[1], {
                    name: match[1],
                    type: this.extractType(match[0]),
                    line: code.substring(0, match.index).split('\n').length
                })
            }
        })

        // Phân tích function C++
        const funcPattern = /(?:int|float|double|char|string|bool|long|void|auto)\s+(\w+)\s*\([^)]*\)/g
        let match
        while ((match = funcPattern.exec(code)) !== null) {
            const funcName = match[1]
            if (funcName !== 'if' && funcName !== 'while' && funcName !== 'for') {
                this.functions.set(funcName, {
                    name: funcName,
                    signature: match[0],
                    line: code.substring(0, match.index).split('\n').length
                })
            }
        }

        // Phân tích class C++
        const classPattern = /class\s+(\w+)/g
        while ((match = classPattern.exec(code)) !== null) {
            this.classes.set(match[1], {
                name: match[1],
                line: code.substring(0, match.index).split('\n').length
            })
        }
    }

    analyzeJava(code: string) {
        // Phân tích biến Java
        const varPattern = /(?:int|float|double|char|String|boolean|long|short|byte)\s+(\w+)/g
        let match
        while ((match = varPattern.exec(code)) !== null) {
            this.variables.set(match[1], {
                name: match[1],
                type: this.extractType(match[0]),
                line: code.substring(0, match.index).split('\n').length
            })
        }

        // Collection types
        const collectionPattern = /(?:ArrayList|HashMap|HashSet|List|Map|Set|LinkedList|TreeMap|TreeSet)(?:<[^>]+>)?\s+(\w+)/g
        while ((match = collectionPattern.exec(code)) !== null) {
            this.variables.set(match[1], {
                name: match[1],
                type: this.extractType(match[0]),
                line: code.substring(0, match.index).split('\n').length
            })
        }

        // Phân tích method Java
        const methodPattern = /(?:public|private|protected|static|\s)+(?:void|int|float|double|String|boolean)\s+(\w+)\s*\([^)]*\)/g
        while ((match = methodPattern.exec(code)) !== null) {
            this.functions.set(match[1], {
                name: match[1],
                signature: match[0],
                line: code.substring(0, match.index).split('\n').length
            })
        }

        // Phân tích class Java
        const classPattern = /class\s+(\w+)/g
        while ((match = classPattern.exec(code)) !== null) {
            this.classes.set(match[1], {
                name: match[1],
                line: code.substring(0, match.index).split('\n').length
            })
        }
    }

    analyzePython(code: string) {
        // Phân tích biến Python
        const varPattern = /^(?![ ]*(?:def|class|if|for|while|return|import))\s*(\w+)\s*=/gm
        let match
        while ((match = varPattern.exec(code)) !== null) {
            if (match[1] !== '_' && !match[1].startsWith('__')) {
                this.variables.set(match[1], {
                    name: match[1],
                    type: 'variable',
                    line: code.substring(0, match.index).split('\n').length
                })
            }
        }

        // Phân tích function Python
        const funcPattern = /def\s+(\w+)\s*\([^)]*\)/g
        while ((match = funcPattern.exec(code)) !== null) {
            this.functions.set(match[1], {
                name: match[1],
                signature: match[0],
                line: code.substring(0, match.index).split('\n').length
            })
        }

        // Phân tích class Python
        const classPattern = /class\s+(\w+)/g
        while ((match = classPattern.exec(code)) !== null) {
            this.classes.set(match[1], {
                name: match[1],
                line: code.substring(0, match.index).split('\n').length
            })
        }
    }

    extractType(matchStr: string): string {
        return matchStr.split(/\s+/)[0].replace(/^std::/, '')
    }

    getVariableType(varName: string): string | null {
        const variable = this.variables.get(varName)
        return variable ? variable.type : null
    }
}

// Built-in methods cho các types
const builtInMethods: Record<string, string[]> = {
    // C++ STL
    'string': ['length', 'size', 'substr', 'find', 'append', 'push_back', 'pop_back', 'clear', 'empty', 'c_str', 'at'],
    'vector': ['push_back', 'pop_back', 'size', 'empty', 'clear', 'at', 'front', 'back', 'resize', 'begin', 'end'],
    'map': ['insert', 'erase', 'find', 'size', 'empty', 'clear', 'begin', 'end'],
    'set': ['insert', 'erase', 'find', 'size', 'empty', 'clear', 'begin', 'end'],
    'queue': ['push', 'pop', 'front', 'back', 'size', 'empty'],
    'stack': ['push', 'pop', 'top', 'size', 'empty'],

    // Java
    'String': ['length', 'charAt', 'substring', 'indexOf', 'toUpperCase', 'toLowerCase', 'trim', 'split', 'replace', 'equals'],
    'ArrayList': ['add', 'remove', 'get', 'set', 'size', 'isEmpty', 'clear', 'contains', 'indexOf'],
    'HashMap': ['put', 'get', 'remove', 'containsKey', 'containsValue', 'size', 'isEmpty', 'clear', 'keySet', 'values'],
    'HashSet': ['add', 'remove', 'contains', 'size', 'isEmpty', 'clear'],
    'LinkedList': ['add', 'remove', 'get', 'addFirst', 'addLast', 'removeFirst', 'removeLast', 'size'],

    // Python
    'list': ['append', 'extend', 'insert', 'remove', 'pop', 'clear', 'index', 'count', 'sort', 'reverse'],
    'dict': ['keys', 'values', 'items', 'get', 'pop', 'clear', 'update'],
    'str': ['upper', 'lower', 'strip', 'split', 'join', 'replace', 'find', 'startswith', 'endswith']
}

export default function MonacoEditorComponent({
                                                  value,
                                                  language = "java",
                                                  height = "100%",
                                                  onChange,
                                                  options = {},
                                              }: Props) {
    const disposablesRef = useRef<any[]>([])
    const analyzerRef = useRef<CodeAnalyzer>(new CodeAnalyzer())

    useEffect(() => {
        return () => {
            disposablesRef.current.forEach((d) => d && d.dispose && d.dispose())
            disposablesRef.current = []
        }
    }, [])

    function handleEditorMount(editor: any, monaco: typeof import("monaco-editor")) {
        // clear previous providers
        disposablesRef.current.forEach((d) => d && d.dispose && d.dispose())
        disposablesRef.current = []

        const analyzer = analyzerRef.current

        // Phân tích code ban đầu
        analyzer.analyze(value, language)

        // Lắng nghe thay đổi để cập nhật phân tích
        const updateDisposable = editor.onDidChangeModelContent(() => {
            const model = editor.getModel()
            if (model) {
                const code = model.getValue()
                const lang = model.getLanguageId()
                analyzer.analyze(code, lang)
            }
        })
        disposablesRef.current.push(updateDisposable)

        // const updateDisposable = editor.onDidChangeModelContent(() => {
        //     const model = editor.getModel()
        //     if (model) {
        //         const code = model.getValue()
        //         const lang = model.getLanguageId()
        //         analyzer.analyze(code, lang)
        //     }
        // })

        // common helper to register and store disposable
        const register = (lang: string, provider: any) => {
            try {
                const d = monaco.languages.registerCompletionItemProvider(lang, provider)
                disposablesRef.current.push(d)
            } catch (e) {
                // ignore if language not supported
            }
        }

        // ============ SMART COMPLETION PROVIDER ============
        const createSmartProvider = (lang: string) => ({
            provideCompletionItems: (model: any, position: any) => {
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                })

                const word = model.getWordUntilPosition(position)
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                }

                const suggestions: any[] = []

                // Kiểm tra xem có đang gọi method không (có dấu . trước)
                const dotMatch = textUntilPosition.match(/(\w+)\.$/);
                if (dotMatch) {
                    const varName = dotMatch[1]
                    const varType = analyzer.getVariableType(varName)

                    if (varType) {
                        // Gợi ý built-in methods
                        const methods = builtInMethods[varType] || []
                        methods.forEach(method => {
                            suggestions.push({
                                label: method,
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: method,
                                range: range,
                                detail: `${varType}.${method}()`,
                                documentation: `Method của ${varType}`,
                                sortText: '0' + method // ưu tiên hiển thị trước
                            })
                        })
                    }

                    return { suggestions }
                }

                // Gợi ý variables
                analyzer.variables.forEach((varInfo: any, varName: string) => {
                    suggestions.push({
                        label: varName,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: varName,
                        range: range,
                        detail: `${varInfo.type} (dòng ${varInfo.line})`,
                        documentation: `Biến đã khai báo`,
                        sortText: '1' + varName
                    })
                })

                // Gợi ý functions
                analyzer.functions.forEach((funcInfo: any, funcName: string) => {
                    suggestions.push({
                        label: funcName,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: funcName + '($0)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range,
                        detail: funcInfo.signature,
                        documentation: `Function (dòng ${funcInfo.line})`,
                        sortText: '2' + funcName
                    })
                })

                // Gợi ý classes
                analyzer.classes.forEach((classInfo: any, className: string) => {
                    suggestions.push({
                        label: className,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: className,
                        range: range,
                        detail: `Class (dòng ${classInfo.line})`,
                        documentation: `Class đã định nghĩa`,
                        sortText: '3' + className
                    })
                })

                return { suggestions }
            }
        })

        register("cpp", createSmartProvider("cpp"))
        register("java", createSmartProvider("java"))
        register("python", createSmartProvider("python"))

        // --- Java snippets ---
        register("java", {
            provideCompletionItems: () => {
                const suggestions = [
                    {
                        label: "main",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "public static void main(String[] args) {",
                            "    ${1:// TODO: code}",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Hàm main tiêu chuẩn",
                        sortText: '9main' // snippet xuống dưới
                    },
                    {
                        label: "sysout",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "System.out.println(${1:\"\"});",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "In ra console (System.out.println)",
                        sortText: '9sysout'
                    },
                    {
                        label: "fori",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for (int i = 0; i < ${1:10}; i++) {",
                            "    ${2:// TODO}",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Vòng lặp for cơ bản",
                        sortText: '9fori'
                    },
                    {
                        label: "trycatch",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "try {",
                            "    ${1:// code}",
                            "} catch (${2:Exception} e) {",
                            "    e.printStackTrace();",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Khối try-catch",
                        sortText: '9trycatch'
                    },
                    {
                        label: "class",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "class ${1:Name} {",
                            "    ${2:}",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Khai báo class cơ bản",
                        sortText: '9class'
                    },
                    {
                        label: "setter",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "public void set${1:Field}(${2:Type} ${3:field}) {",
                            "    this.${3:field} = ${3:field};",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Tạo phương thức Setter",
                        sortText: '9setter'
                    },
                    {
                        label: "getter",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "public ${1:Type} get${2:Field}() {",
                            "    return ${3:field};",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Tạo phương thức Getter",
                        sortText: '9getter'
                    },
                    {
                        label: "iter",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for (${1:Type} ${2:element} : ${3:collection}) {",
                            "    ${4:// TODO}",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Vòng lặp For-each (Iteration)",
                        sortText: '9iter'
                    },
                ]
                return { suggestions }
            },
        })

        // --- C++ snippets ---
        register("cpp", {
            provideCompletionItems: () => {
                const suggestions = [
                    {
                        label: "main",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "int main() {",
                            "    ios::sync_with_stdio(false);",
                            "    cin.tie(nullptr);",
                            "    ${1:// TODO}",
                            "    return 0;",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Hàm main (C++) kèm fast IO",
                        sortText: '9main'
                    },
                    {
                        label: "cout",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "cout << ${1:var} << endl;",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "In ra console (cout)",
                        sortText: '9cout'
                    },
                    {
                        label: "fori",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for (int i = 0; i < ${1:N}; ++i) {",
                            "    ${2:// TODO}",
                            "}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Vòng lặp for (C++)",
                        sortText: '9fori'
                    },
                    {
                        label: "vector",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "vector<${1:int}> ${2:name};",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Khai báo vector",
                        sortText: '9vector'
                    },
                    {
                        label: "incl",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "#include <${1:iostream}>",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Include thư viện",
                        sortText: '9incl'
                    },
                    {
                        label: "usingns",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "using namespace std;",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Sử dụng namespace std",
                        sortText: '9usingns'
                    },
                    {
                        label: "ifndef",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "#ifndef ${1:FILE_H}",
                            "#define ${1:FILE_H}",
                            "",
                            "${2:}",
                            "",
                            "#endif // ${1:FILE_H}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Header Guard (#ifndef)",
                        sortText: '9ifndef'
                    },
                    {
                        label: "typedef",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "typedef ${1:long long} ${2:ll};",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Định nghĩa kiểu (typedef)",
                        sortText: '9typedef'
                    },
                ]
                return { suggestions }
            },
        })
        register("python", {
            provideCompletionItems: () => {
                const suggestions = [
                    {
                        label: "ifmain",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "if __name__ == \"__main__\":",
                            "    ${1:main()}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Kiểm tra điểm vào chính",
                        sortText: '9ifmain'
                    },
                    {
                        label: "print",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "print(${1:})",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Hàm print",
                        sortText: '9print'
                    },
                    {
                        label: "for",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for ${1:x} in ${2:iterable}:",
                            "    ${3:# TODO}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Vòng lặp for (Python)",
                        sortText: '9for'
                    },
                    {
                        label: "listcomp",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: "[${1:expr} for ${2:var} in ${3:iterable} if ${4:cond}]",
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "List comprehension",
                        sortText: '9listcomp'
                    },
                    {
                        label: "def",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "def ${1:function_name}(${2:args}):",
                            "    ${3:pass}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Khai báo hàm/function",
                        sortText: '9def'
                    },
                    {
                        label: "class",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "class ${1:ClassName}:",
                            "    def __init__(self, ${2:params}):",
                            "        ${3:pass}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Khai báo class (có __init__)",
                        sortText: '9class'
                    },
                    {
                        label: "pfori",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "for ${1:i} in range(len(${2:list_name})):",
                            "    ${3:# TODO}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Vòng lặp for index (range(len(..)))",
                        sortText: '9pfori'
                    },
                    {
                        label: "withopen",
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            "with open('${1:file.txt}', '${2:r}') as ${3:f}:",
                            "    ${4:data = ${3:f}.read()}",
                        ].join("\n"),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: "Mở file với 'with open()'",
                        sortText: '9withopen'
                    },
                ]
                return { suggestions }
            },
        })
        // enable editor behaviors
        editor.updateOptions({
            suggestOnTriggerCharacters: true,
            quickSuggestions: { strings: true, comments: false, other: true },
            wordBasedSuggestions: 'off', // tắt word-based để ưu tiên suggestions của mình
        })
    }

    return (
        <div className="h-full w-full" style={{ height }}>
            <MonacoEditor
                height={height}
                language={language}
                theme="vs-dark"
                value={value}
                onChange={onChange}
                onMount={handleEditorMount}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    ...options,
                }}
            />
        </div>
    )
}