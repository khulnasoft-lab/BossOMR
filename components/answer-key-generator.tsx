"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnswerKey } from "@/components/answer-key"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileDown, FileUp, XCircle, RotateCw, Repeat, ArrowDownUp, Shuffle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface AnswerKeyGeneratorProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    showRollNumber: boolean
    showName: boolean
    showInstructions: boolean
    uniqueId: string
  }
  answers: Record<number, string>
  onAnswerChange: (questionNum: number, answer: string) => void
  onClearAll: () => void
  onGenerateRandom: () => void
}

interface AnswerPattern {
  name: string
  description: string
  icon: React.ReactNode
  generate: (numQuestions: number, optionsPerQuestion: number) => Record<number, string>
}

export function AnswerKeyGenerator({
  config,
  answers,
  onAnswerChange,
  onClearAll,
  onGenerateRandom,
}: AnswerKeyGeneratorProps) {
  const answerKeyRef = useRef<HTMLDivElement>(null)
  const [importDialog, setImportDialog] = useState(false)
  const [importText, setImportText] = useState("")
  const [importPreview, setImportPreview] = useState<Record<number, string>>({})
  const [importError, setImportError] = useState("")
  const [validationResults, setValidationResults] = useState<{
    duplicates: number[]
    missing: number[]
    invalid: Array<{ question: number; value: string }>
  }>({
    duplicates: [],
    missing: [],
    invalid: [],
  })
  const optionLetters = ["A", "B", "C", "D", "E"]

  const answerPatterns: AnswerPattern[] = [
    {
      name: "Sequential",
      description: "A, B, C, D, A, B, C, D...",
      icon: <Repeat size={16} />,
      generate: (numQuestions, optionsPerQuestion) => {
        const result: Record<number, string> = {}
        for (let i = 1; i <= numQuestions; i++) {
          const index = (i - 1) % optionsPerQuestion
          result[i] = optionLetters[index]
        }
        return result
      },
    },
    {
      name: "Alternating",
      description: "A, B, A, B, A, B...",
      icon: <ArrowDownUp size={16} />,
      generate: (numQuestions, optionsPerQuestion) => {
        const result: Record<number, string> = {}
        for (let i = 1; i <= numQuestions; i++) {
          const index = (i - 1) % 2
          result[i] = optionLetters[index]
        }
        return result
      },
    },
    {
      name: "Random",
      description: "Randomly generated answers",
      icon: <Shuffle size={16} />,
      generate: (numQuestions, optionsPerQuestion) => {
        const result: Record<number, string> = {}
        for (let i = 1; i <= numQuestions; i++) {
          const index = Math.floor(Math.random() * optionsPerQuestion)
          result[i] = optionLetters[index]
        }
        return result
      },
    },
    {
      name: "All Same",
      description: "All answers set to the same option",
      icon: <RotateCw size={16} />,
      generate: (numQuestions, optionsPerQuestion) => {
        const result: Record<number, string> = {}
        const index = Math.floor(Math.random() * optionsPerQuestion)
        for (let i = 1; i <= numQuestions; i++) {
          result[i] = optionLetters[index]
        }
        return result
      },
    },
  ]

  const handlePrintAnswerKey = () => {
    const printContent = answerKeyRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Answer Key - ${config.title}</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Inter, sans-serif; background: white; color: black; }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
          .border-2 { border: 2px solid black; }
          .border { border: 1px solid black; }
          .border-b-2 { border-bottom: 2px solid black; }
          .p-6 { padding: 24px; }
          .p-4 { padding: 16px; }
          .py-4 { padding-top: 16px; padding-bottom: 16px; }
          .pb-4 { padding-bottom: 16px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-1 { margin-bottom: 4px; }
          .mr-2 { margin-right: 8px; }
          .mr-4 { margin-right: 16px; }
          .mt-1 { margin-top: 4px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-2xl { font-size: 24px; }
          .text-lg { font-size: 18px; }
          .text-sm { font-size: 14px; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .gap-4 { gap: 16px; }
          .gap-x-8 { column-gap: 32px; }
          .gap-y-2 { row-gap: 8px; }
          .w-full { width: 100%; }
          .w-8 { width: 32px; }
          .bg-green-100 { background-color: #dcfce7; }
          .text-green-800 { color: #166534; }
          .rounded { border-radius: 4px; }
          @media (min-width: 768px) {
            .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .md\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          }
          @media (min-width: 1024px) {
            .lg\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
            .lg\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportText(content)
      parseImportText(content)
    }
    reader.readAsText(file)
  }

  const parseImportText = (text: string) => {
    setImportError("")
    setImportPreview({})
    setValidationResults({
      duplicates: [],
      missing: [],
      invalid: [],
    })

    if (!text.trim()) return

    try {
      const lines = text.trim().split("\n")
      const parsed: Record<number, string> = {}
      const validOptions = optionLetters.slice(0, config.optionsPerQuestion)
      const duplicates: number[] = []
      const invalid: Array<{ question: number; value: string }> = []

      // Try to detect format
      const firstLine = lines[0].trim()

      if (firstLine.includes(",") || firstLine.includes("\t")) {
        // CSV format: "1,A" or "Question 1,A" or just "A,B,C,D..."
        lines.forEach((line, index) => {
          const parts = line.split(/[,\t]/).map((p) => p.trim())

          if (parts.length >= 2) {
            // Format: "1,A" or "Question 1,A"
            const questionNum = Number.parseInt(parts[0].replace(/\D/g, "")) || index + 1
            const answer = parts[1].toUpperCase()

            if (questionNum <= config.numQuestions) {
              if (validOptions.includes(answer)) {
                if (parsed[questionNum]) {
                  duplicates.push(questionNum)
                }
                parsed[questionNum] = answer
              } else {
                invalid.push({ question: questionNum, value: answer })
              }
            }
          } else if (parts.length === 1 && parts[0]) {
            // Format: Single column of answers "A\nB\nC..."
            const questionNum = index + 1
            const answer = parts[0].toUpperCase()

            if (questionNum <= config.numQuestions) {
              if (validOptions.includes(answer)) {
                parsed[questionNum] = answer
              } else {
                invalid.push({ question: questionNum, value: answer })
              }
            }
          }
        })
      } else {
        // Plain text format: "ABCDABCD..." or "A B C D A B C D..."
        const cleanText = text.replace(/\s+/g, "").toUpperCase()

        if (cleanText.length <= config.numQuestions) {
          // Single string of answers
          for (let i = 0; i < cleanText.length && i < config.numQuestions; i++) {
            const answer = cleanText[i]
            if (validOptions.includes(answer)) {
              parsed[i + 1] = answer
            } else {
              invalid.push({ question: i + 1, value: answer })
            }
          }
        } else {
          // Space-separated answers
          const answers = text
            .trim()
            .split(/\s+/)
            .map((a) => a.toUpperCase())
          answers.forEach((answer, index) => {
            const questionNum = index + 1
            if (questionNum <= config.numQuestions) {
              if (validOptions.includes(answer)) {
                parsed[questionNum] = answer
              } else {
                invalid.push({ question: questionNum, value: answer })
              }
            }
          })
        }
      }

      // Find missing questions
      const missing: number[] = []
      for (let i = 1; i <= config.numQuestions; i++) {
        if (!parsed[i]) {
          missing.push(i)
        }
      }

      setValidationResults({
        duplicates,
        missing,
        invalid,
      })

      if (Object.keys(parsed).length === 0) {
        setImportError("No valid answers found. Please check your format.")
      } else {
        setImportPreview(parsed)
      }
    } catch (error) {
      setImportError("Error parsing file. Please check the format.")
    }
  }

  const applyImportedAnswers = () => {
    Object.entries(importPreview).forEach(([questionNum, answer]) => {
      onAnswerChange(Number.parseInt(questionNum), answer)
    })
    setImportDialog(false)
    setImportText("")
    setImportPreview({})
    setImportError("")
    setValidationResults({
      duplicates: [],
      missing: [],
      invalid: [],
    })
  }

  const clearImport = () => {
    setImportText("")
    setImportPreview({})
    setImportError("")
    setValidationResults({
      duplicates: [],
      missing: [],
      invalid: [],
    })
  }

  const exportToCSV = () => {
    if (Object.keys(answers).length === 0) return

    let csvContent = "Question,Answer\n"

    Object.entries(answers)
      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
      .forEach(([questionNum, answer]) => {
        csvContent += `${questionNum},${answer}\n`
      })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${config.title.replace(/\s+/g, "_")}_answers.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const applyPattern = (pattern: AnswerPattern) => {
    const newAnswers = pattern.generate(config.numQuestions, config.optionsPerQuestion)
    Object.entries(newAnswers).forEach(([questionNum, answer]) => {
      onAnswerChange(Number.parseInt(questionNum), answer)
    })
  }

  const answeredQuestions = Object.keys(answers).length
  const completionPercentage = Math.round((answeredQuestions / config.numQuestions) * 100)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="glass-card border-0">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white">Answer Key Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-[#0070f3]/10 p-4 rounded-lg border border-[#0070f3]/20">
            <h3 className="font-medium mb-2 text-white">Progress</h3>
            <p className="text-sm text-gray-300">
              {answeredQuestions} of {config.numQuestions} questions answered ({completionPercentage}%)
            </p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
              <div
                className="bg-[#0070f3] h-2 rounded-full transition-all duration-300 blue-glow"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-black/40">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="answers">Answers</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onClearAll}
                  className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
                >
                  <XCircle size={16} className="mr-2" />
                  Clear All
                </Button>

                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={answeredQuestions === 0}
                  className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
                >
                  <FileDown size={16} className="mr-2" />
                  Export CSV
                </Button>

                <Dialog open={importDialog} onOpenChange={setImportDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white col-span-2"
                    >
                      <FileUp size={16} className="mr-2" />
                      Import Answers
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Import Answer Key</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file-upload" className="text-sm font-medium text-gray-300">
                          Upload File (CSV, TXT)
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="mt-1 bg-black/40 border-gray-700"
                        />
                      </div>

                      <div className="text-sm text-gray-400">
                        <p className="font-medium mb-2 text-gray-300">Supported formats:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong className="text-gray-200">CSV:</strong> "1,A" or "Question 1,A" (one per line)
                          </li>
                          <li>
                            <strong className="text-gray-200">Plain text:</strong> "ABCDABCD..." or "A B C D A B C D..."
                          </li>
                          <li>
                            <strong className="text-gray-200">Single column:</strong> One answer per line (A, B, C,
                            D...)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <Label htmlFor="import-text" className="text-sm font-medium text-gray-300">
                          Or paste text directly:
                        </Label>
                        <Textarea
                          id="import-text"
                          value={importText}
                          onChange={(e) => {
                            setImportText(e.target.value)
                            parseImportText(e.target.value)
                          }}
                          placeholder="Paste your answers here..."
                          className="mt-1 h-32 bg-black/40 border-gray-700 text-white"
                        />
                      </div>

                      {importError && (
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{importError}</AlertDescription>
                        </Alert>
                      )}

                      {(validationResults.duplicates.length > 0 || validationResults.invalid.length > 0) && (
                        <div className="bg-amber-900/20 border border-amber-900/50 rounded-md p-3 text-sm">
                          <h4 className="font-medium text-amber-300 mb-2">Validation Warnings</h4>

                          {validationResults.duplicates.length > 0 && (
                            <div className="mb-2">
                              <p className="text-amber-200">Duplicate questions found:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {validationResults.duplicates.map((q) => (
                                  <Badge
                                    key={q}
                                    variant="outline"
                                    className="bg-amber-900/30 border-amber-500/30 text-amber-300"
                                  >
                                    Q{q}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {validationResults.invalid.length > 0 && (
                            <div>
                              <p className="text-amber-200">Invalid answers found:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {validationResults.invalid.map(({ question, value }) => (
                                  <Badge
                                    key={question}
                                    variant="outline"
                                    className="bg-amber-900/30 border-amber-500/30 text-amber-300"
                                  >
                                    Q{question}: {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {Object.keys(importPreview).length > 0 && (
                        <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-white">Preview</h4>
                            <Badge variant="outline" className="bg-[#0070f3]/20 border-[#0070f3]/30 text-[#0070f3]">
                              {Object.keys(importPreview).length} answers found
                            </Badge>
                          </div>
                          <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                            {Object.entries(importPreview)
                              .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                              .map(([questionNum, answer]) => (
                                <div key={questionNum} className="text-xs">
                                  <span className="font-medium text-gray-400">{questionNum}:</span>
                                  <span className="ml-1 bg-[#0070f3]/20 text-[#0070f3] px-1 rounded">{answer}</span>
                                </div>
                              ))}
                          </div>

                          {validationResults.missing.length > 0 && (
                            <div className="mt-3 text-xs text-gray-400">
                              <span className="text-gray-300">Missing answers: </span>
                              {validationResults.missing.length > 10
                                ? `${validationResults.missing.length} questions`
                                : validationResults.missing.map((q) => `Q${q}`).join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={clearImport}
                          className="border-gray-700 hover:border-gray-600"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={applyImportedAnswers}
                          disabled={Object.keys(importPreview).length === 0}
                          className="bg-[#0070f3] hover:bg-[#0060d3]"
                        >
                          Import {Object.keys(importPreview).length} Answers
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  className="col-span-2 bg-[#0070f3] hover:bg-[#0060d3] blue-glow"
                  onClick={handlePrintAnswerKey}
                  disabled={answeredQuestions === 0}
                >
                  Print Answer Key
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {answerPatterns.map((pattern) => (
                  <Button
                    key={pattern.name}
                    variant="outline"
                    onClick={() => applyPattern(pattern)}
                    className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white justify-start"
                  >
                    <div className="mr-2 text-[#0070f3]">{pattern.icon}</div>
                    <div className="text-left">
                      <div className="font-medium text-white">{pattern.name}</div>
                      <div className="text-xs text-gray-400">{pattern.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="answers" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {Array.from({ length: config.numQuestions }, (_, i) => {
                  const questionNum = i + 1
                  return (
                    <div key={questionNum} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12 text-gray-300">Q{questionNum}:</span>
                      <Select
                        value={answers[questionNum] || ""}
                        onValueChange={(value) => onAnswerChange(questionNum, value)}
                      >
                        <SelectTrigger className="w-20 h-8 bg-black/40 border-gray-700">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {optionLetters.slice(0, config.optionsPerQuestion).map((letter) => (
                            <SelectItem key={letter} value={letter}>
                              {letter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="border border-gray-800 rounded-lg p-4 bg-black/40 overflow-auto max-h-[800px] glass-panel">
        <div ref={answerKeyRef} className="bg-white text-black">
          <AnswerKey config={config} answers={answers} />
        </div>
      </div>
    </div>
  )
}
