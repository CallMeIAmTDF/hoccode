"use client"

import { useEffect, useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TinyMCEEditorProps {
    value: string
    onChange: (value: string) => void
    height?: number
    placeholder?: string
}

export default function TinyMCEEditor({
                                          value,
                                          onChange,
                                          height = 500,
                                          placeholder = "Nhập nội dung...",
                                      }: TinyMCEEditorProps) {
    const editorRef = useRef<any>(null)
    const [isEditorLoaded, setIsEditorLoaded] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsEditorLoaded(true)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="border rounded-md overflow-hidden">
            {!isEditorLoaded && <Skeleton className="w-full" style={{ height: `${height}px` }} />}

            <div className={!isEditorLoaded ? "hidden" : ""}>
                <Editor
                    apiKey="c7g3bowjbi9v4vokvur1e5uskxie7ky57ykmuzyouehu6hfh"
                    onInit={(_, editor) => {
                        editorRef.current = editor
                    }}
                    value={value}
                    onEditorChange={(newValue) => onChange(newValue)}
                    init={{
                        height,
                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                        entity_encoding: "raw"
                    }}

                    initialValue={""}
                />
            </div>
        </div>
    )
}