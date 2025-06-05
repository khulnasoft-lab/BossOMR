"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { OMRSheet } from "@/components/omr-sheet"
import { OMRGridSheet } from "@/components/omr-grid-sheet"
import { AnswerKeyGenerator } from "@/components/answer-key-generator"
import { AnswerKeyComparison } from "@/components/answer-key-comparison"
import { StudentResponseScanner } from "@/components/student-response-scanner"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Settings, Eye, GitCompare, Scan, BarChart3 } from "lucide-react"

export function OMRSheetGenerator() {
  const [config, setConfig] = useState({
    title: "Examination OMR Sheet",
    numQuestions: 50,
    optionsPerQuestion: 4,
    showRollNumber: true,
    showName: true,
    showInstructions: true,
    uniqueId: generateUniqueId(),
    format: "standard" as "standard" | "grid",
  })

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [studentResponses, setStudentResponses] = useState<
    Array<{
      id: string
      name: string
      rollNumber: string
      responses: Record<number, string>
      score: number
      percentage: number
      timestamp: Date
    }>
  >([])
  const [currentView, setCurrentView] = useState<"sheet" | "answerkey" | "comparison" | "scanner" | "analytics">(
    "sheet",
  )

  const sheetRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = sheetRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>OMR Sheet</title>
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
          .mt-1 { margin-top: 4px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-2xl { font-size: 24px; }
          .text-sm { font-size: 14px; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-4 { gap: 16px; }
          .gap-x-8 { column-gap: 32px; }
          .gap-y-1 { row-gap: 4px; }
          .space-x-3 > * + * { margin-left: 12px; }
          .space-y-1 > * + * { margin-top: 4px; }
          .w-full { width: 100%; }
          .w-6 { width: 24px; }
          .w-7 { width: 28px; }
          .h-6 { height: 24px; }
          .h-8 { height: 32px; }
          .min-w-20 { min-width: 80px; }
          .flex-1 { flex: 1; }
          .rounded-full { border-radius: 50%; }
          .justify-center { justify-content: center; }
          .list-disc { list-style-type: disc; }
          .pl-5 { padding-left: 20px; }
          @media (min-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          }
          @media (min-width: 1024px) {
            .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
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

  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  function regenerateId() {
    setConfig({ ...config, uniqueId: generateUniqueId() })
  }

  const handleAnswerChange = (questionNum: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionNum]: answer }))
  }

  const clearAllAnswers = () => {
    setAnswers({})
  }

  const generateRandomAnswers = () => {
    const optionLetters = ["A", "B", "C", "D", "E"]
    const randomAnswers: Record<number, string> = {}
    for (let i = 1; i <= config.numQuestions; i++) {
      const randomIndex = Math.floor(Math.random() * config.optionsPerQuestion)
      randomAnswers[i] = optionLetters[randomIndex]
    }
    setAnswers(randomAnswers)
  }

  const addStudentResponse = (response: {
    id: string
    name: string
    rollNumber: string
    responses: Record<number, string>
    score: number
    percentage: number
  }) => {
    setStudentResponses((prev) => [...prev, { ...response, timestamp: new Date() }])
  }

  const navigationItems = [
    { id: "sheet", label: "OMR Sheet", icon: <Eye size={18} /> },
    { id: "answerkey", label: "Answer Key", icon: <Settings size={18} /> },
    { id: "comparison", label: "Compare", icon: <GitCompare size={18} /> },
    { id: "scanner", label: "Scanner", icon: <Scan size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex bg-black/40 rounded-lg p-1 glass-panel overflow-x-auto">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              onClick={() => setCurrentView(item.id as any)}
              className="rounded-md gap-2 whitespace-nowrap"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {currentView === "sheet" && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass-card border-0">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Sheet Title
                  </Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="bg-black/40 border-gray-700 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format" className="text-gray-300">
                    Sheet Format
                  </Label>
                  <Select
                    value={config.format}
                    onValueChange={(value) => setConfig({ ...config, format: value as "standard" | "grid" })}
                  >
                    <SelectTrigger id="format" className="bg-black/40 border-gray-700">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Format</SelectItem>
                      <SelectItem value="grid">Grid Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Number of Questions: {config.numQuestions}</Label>
                  <Slider
                    value={[config.numQuestions]}
                    min={10}
                    max={200}
                    step={5}
                    onValueChange={(value) => setConfig({ ...config, numQuestions: value[0] })}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="options" className="text-gray-300">
                    Options per Question
                  </Label>
                  <Select
                    value={config.optionsPerQuestion.toString()}
                    onValueChange={(value) => setConfig({ ...config, optionsPerQuestion: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="options" className="bg-black/40 border-gray-700">
                      <SelectValue placeholder="Select options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 (A-B)</SelectItem>
                      <SelectItem value="3">3 (A-C)</SelectItem>
                      <SelectItem value="4">4 (A-D)</SelectItem>
                      <SelectItem value="5">5 (A-E)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="roll-number" className="text-gray-300">
                    Show Roll Number Field
                  </Label>
                  <Switch
                    id="roll-number"
                    checked={config.showRollNumber}
                    onCheckedChange={(checked) => setConfig({ ...config, showRollNumber: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="text-gray-300">
                    Show Name Field
                  </Label>
                  <Switch
                    id="name"
                    checked={config.showName}
                    onCheckedChange={(checked) => setConfig({ ...config, showName: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="instructions" className="text-gray-300">
                    Show Instructions
                  </Label>
                  <Switch
                    id="instructions"
                    checked={config.showInstructions}
                    onCheckedChange={(checked) => setConfig({ ...config, showInstructions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="unique-id" className="text-gray-300">
                    Sheet ID: <span className="text-white">{config.uniqueId}</span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateId}
                    className="border-gray-700 hover:border-blue-500"
                  >
                    Regenerate ID
                  </Button>
                </div>

                <Button className="w-full bg-[#0070f3] hover:bg-[#0060d3] blue-glow" onClick={handlePrint}>
                  Print OMR Sheet
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/40 overflow-auto max-h-[800px] glass-panel">
            <div ref={sheetRef} className="bg-white text-black">
              {config.format === "standard" ? <OMRSheet config={config} /> : <OMRGridSheet config={config} />}
            </div>
          </div>
        </div>
      )}

      {currentView === "answerkey" && (
        <AnswerKeyGenerator
          config={config}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onClearAll={clearAllAnswers}
          onGenerateRandom={generateRandomAnswers}
        />
      )}

      {currentView === "comparison" && (
        <AnswerKeyComparison config={config} primaryAnswers={answers} onAnswerChange={handleAnswerChange} />
      )}

      {currentView === "scanner" && (
        <StudentResponseScanner
          config={config}
          answerKey={answers}
          onAddResponse={addStudentResponse}
          studentResponses={studentResponses}
        />
      )}

      {currentView === "analytics" && (
        <AnalyticsDashboard config={config} answerKey={answers} studentResponses={studentResponses} />
      )}
    </div>
  )
}
