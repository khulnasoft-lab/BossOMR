"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scan, UserPlus, Download, Camera, XCircle } from "lucide-react"

interface StudentResponse {
  id: string
  name: string
  rollNumber: string
  responses: Record<number, string>
  score: number
  percentage: number
  timestamp: Date
}

interface StudentResponseScannerProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    uniqueId: string
  }
  answerKey: Record<number, string>
  onAddResponse: (response: Omit<StudentResponse, "timestamp">) => void
  studentResponses: StudentResponse[]
}

export function StudentResponseScanner({
  config,
  answerKey,
  onAddResponse,
  studentResponses,
}: StudentResponseScannerProps) {
  const [studentName, setStudentName] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [responseText, setResponseText] = useState("")
  const [parsedResponses, setParsedResponses] = useState<Record<number, string>>({})
  const [scanError, setScanError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const optionLetters = ["A", "B", "C", "D", "E"]

  const parseResponseText = (text: string) => {
    setScanError("")
    setParsedResponses({})

    if (!text.trim()) return

    try {
      const lines = text.trim().split("\n")
      const parsed: Record<number, string> = {}
      const validOptions = optionLetters.slice(0, config.optionsPerQuestion)

      const firstLine = lines[0].trim()

      if (firstLine.includes(",") || firstLine.includes("\t")) {
        lines.forEach((line, index) => {
          const parts = line.split(/[,\t]/).map((p) => p.trim())

          if (parts.length >= 2) {
            const questionNum = Number.parseInt(parts[0].replace(/\D/g, "")) || index + 1
            const answer = parts[1].toUpperCase()

            if (questionNum <= config.numQuestions && validOptions.includes(answer)) {
              parsed[questionNum] = answer
            }
          } else if (parts.length === 1 && parts[0]) {
            const questionNum = index + 1
            const answer = parts[0].toUpperCase()

            if (questionNum <= config.numQuestions && validOptions.includes(answer)) {
              parsed[questionNum] = answer
            }
          }
        })
      } else {
        const cleanText = text.replace(/\s+/g, "").toUpperCase()

        if (cleanText.length <= config.numQuestions) {
          for (let i = 0; i < cleanText.length && i < config.numQuestions; i++) {
            const answer = cleanText[i]
            if (validOptions.includes(answer)) {
              parsed[i + 1] = answer
            }
          }
        } else {
          const answers = text
            .trim()
            .split(/\s+/)
            .map((a) => a.toUpperCase())
          answers.forEach((answer, index) => {
            const questionNum = index + 1
            if (questionNum <= config.numQuestions && validOptions.includes(answer)) {
              parsed[questionNum] = answer
            }
          })
        }
      }

      if (Object.keys(parsed).length === 0) {
        setScanError("No valid responses found. Please check your format.")
      } else {
        setParsedResponses(parsed)
      }
    } catch (error) {
      setScanError("Error parsing responses. Please check the format.")
    }
  }

  const calculateScore = (responses: Record<number, string>) => {
    let correct = 0
    const totalAnswered = Object.keys(responses).length

    Object.entries(responses).forEach(([questionNum, answer]) => {
      if (answerKey[Number.parseInt(questionNum)] === answer) {
        correct++
      }
    })

    return {
      score: correct,
      percentage: totalAnswered > 0 ? Math.round((correct / config.numQuestions) * 100) : 0,
    }
  }

  const submitResponse = () => {
    if (!studentName.trim() || !rollNumber.trim() || Object.keys(parsedResponses).length === 0) {
      setScanError("Please fill in all required fields and scan responses.")
      return
    }

    const { score, percentage } = calculateScore(parsedResponses)

    onAddResponse({
      id: `${rollNumber}_${Date.now()}`,
      name: studentName.trim(),
      rollNumber: rollNumber.trim(),
      responses: parsedResponses,
      score,
      percentage,
    })

    // Clear form
    setStudentName("")
    setRollNumber("")
    setResponseText("")
    setParsedResponses({})
    setScanError("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate OCR processing
    setTimeout(() => {
      const mockResponses = Array.from({ length: config.numQuestions }, (_, i) => {
        const randomIndex = Math.floor(Math.random() * config.optionsPerQuestion)
        return optionLetters[randomIndex]
      }).join("")

      setResponseText(mockResponses)
      parseResponseText(mockResponses)
    }, 1000)
  }

  const exportResults = () => {
    if (studentResponses.length === 0) return

    let csvContent = "Name,Roll Number,Score,Percentage,Timestamp\n"

    studentResponses.forEach((response) => {
      csvContent += `${response.name},${response.rollNumber},${response.score},${response.percentage}%,${response.timestamp.toLocaleString()}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `student_results_${config.uniqueId}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }

    studentResponses.forEach((response) => {
      if (response.percentage >= 90) distribution.A++
      else if (response.percentage >= 80) distribution.B++
      else if (response.percentage >= 70) distribution.C++
      else if (response.percentage >= 60) distribution.D++
      else distribution.F++
    })

    return distribution
  }

  const gradeDistribution = getGradeDistribution()
  const averageScore =
    studentResponses.length > 0
      ? Math.round(studentResponses.reduce((sum, r) => sum + r.percentage, 0) / studentResponses.length)
      : 0

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Scan size={20} />
              Scan Student Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="text-gray-300">
                Student Name
              </Label>
              <Input
                id="student-name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="bg-black/40 border-gray-700"
                placeholder="Enter student name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roll-number" className="text-gray-300">
                Roll Number
              </Label>
              <Input
                id="roll-number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="bg-black/40 border-gray-700"
                placeholder="Enter roll number"
              />
            </div>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-black/40">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="scan">Scan Image</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responses" className="text-gray-300">
                    Student Responses
                  </Label>
                  <Textarea
                    id="responses"
                    value={responseText}
                    onChange={(e) => {
                      setResponseText(e.target.value)
                      parseResponseText(e.target.value)
                    }}
                    placeholder="Enter responses (e.g., ABCDABCD... or A,B,C,D...)"
                    className="h-32 bg-black/40 border-gray-700 text-white"
                  />
                </div>
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Upload OMR Sheet Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
                  >
                    <Camera size={16} className="mr-2" />
                    Upload Image for OCR
                  </Button>
                  <p className="text-xs text-gray-400">
                    Note: This is a demo. In production, this would use OCR to scan the OMR sheet.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {scanError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            {Object.keys(parsedResponses).length > 0 && (
              <div className="bg-[#0070f3]/10 p-3 rounded-lg border border-[#0070f3]/20">
                <h4 className="font-medium text-white mb-2">
                  Scanned Responses ({Object.keys(parsedResponses).length} answers)
                </h4>
                <div className="grid grid-cols-8 gap-1 text-xs">
                  {Object.entries(parsedResponses)
                    .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                    .map(([questionNum, answer]) => (
                      <div key={questionNum} className="text-center">
                        <span className="text-gray-400">{questionNum}:</span>
                        <span className="ml-1 text-[#0070f3] font-medium">{answer}</span>
                      </div>
                    ))}
                </div>
                {Object.keys(answerKey).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#0070f3]/20">
                    <div className="text-sm">
                      <span className="text-gray-300">Predicted Score: </span>
                      <span className="text-white font-medium">
                        {calculateScore(parsedResponses).score}/{config.numQuestions} (
                        {calculateScore(parsedResponses).percentage}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full bg-[#0070f3] hover:bg-[#0060d3]"
              onClick={submitResponse}
              disabled={!studentName.trim() || !rollNumber.trim() || Object.keys(parsedResponses).length === 0}
            >
              <UserPlus size={16} className="mr-2" />
              Add Student Response
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Class Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-[#0070f3]">{studentResponses.length}</div>
                <div className="text-sm text-gray-300">Students Scanned</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{averageScore}%</div>
                <div className="text-sm text-gray-300">Average Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Grade Distribution</h4>
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex justify-between items-center">
                  <span className="text-gray-300">Grade {grade}:</span>
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={exportResults}
              disabled={studentResponses.length === 0}
              className="w-full border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
            >
              <Download size={16} className="mr-2" />
              Export Results
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {studentResponses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No submissions yet</p>
              ) : (
                studentResponses
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((response) => (
                    <div key={response.id} className="bg-black/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-white">{response.name}</div>
                          <div className="text-sm text-gray-400">Roll: {response.rollNumber}</div>
                        </div>
                        <Badge
                          className={
                            response.percentage >= 80
                              ? "bg-green-900/30 text-green-400 border-green-900/50"
                              : response.percentage >= 60
                                ? "bg-yellow-900/30 text-yellow-400 border-yellow-900/50"
                                : "bg-red-900/30 text-red-400 border-red-900/50"
                          }
                        >
                          {response.percentage}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        {response.score}/{config.numQuestions} correct • {response.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
