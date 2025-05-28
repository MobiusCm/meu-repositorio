"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
  analysisProgress?: {
    stage: 'processando' | 'upload' | 'analisando' | 'completo';
    percentage: number;
  }
}

export function FileUploader({ onFileUpload, isLoading, analysisProgress }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith(".txt")) {
        setFile(droppedFile)
        simulateProgress(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      simulateProgress(selectedFile)
    }
  }

  const simulateProgress = (file: File) => {
    setUploadProgress(0)

    // Simular apenas até 33% (processamento inicial)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5
        if (newProgress >= 33) {
          clearInterval(interval)
          return 33
        }
        return newProgress
      })
    }, 50)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Se temos o progresso de análise, use-o. Caso contrário, use o progresso de upload simulado
  const progressValue = isLoading && analysisProgress 
    ? analysisProgress.percentage 
    : uploadProgress;

  // Determinar o estágio atual para exibição
  const currentStage = isLoading && analysisProgress 
    ? analysisProgress.stage 
    : progressValue >= 33 ? 'upload' : 'processando';

  // Texto de estágio para exibição
  const stageText = {
    processando: "Processando arquivo",
    upload: "Enviando para o servidor",
    analisando: "Analisando conversas",
    completo: "Análise completa"
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Solte o arquivo de exportação do WhatsApp aqui</p>
              <p className="text-xs text-muted-foreground mb-3">Apenas arquivos .txt exportados do WhatsApp são suportados</p>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Selecionar Arquivo
              </Button>
              <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemoveFile} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-2">
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                {currentStage === 'completo' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <Loader2 className="h-4 w-4 text-primary mr-1 animate-spin" />
                )}
                <span className="text-xs font-medium">{stageText[currentStage]}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {progressValue.toFixed(0)}%
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={`text-xs border rounded-md p-2 text-center ${currentStage === 'processando' || currentStage === 'upload' || currentStage === 'analisando' || currentStage === 'completo' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              Processamento
            </div>
            <div className={`text-xs border rounded-md p-2 text-center ${currentStage === 'upload' || currentStage === 'analisando' || currentStage === 'completo' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              Upload
            </div>
            <div className={`text-xs border rounded-md p-2 text-center ${currentStage === 'analisando' || currentStage === 'completo' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              Análise
            </div>
          </div>
          
          <div className="flex justify-end mt-3">
            <Button disabled={progressValue < 100 || isLoading} onClick={() => onFileUpload(file)}>
              {isLoading ? "Processando..." : "Analisar Chat"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
