"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GitCompare, Download, AlertTriangle } from "lucide-react"

interface AnswerKeyComparisonProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    uniqueId: string
  }
  primaryAnswers: Record<number, string>
  onAnswerChange: (questionNum: number, answer: string) => void
}

export function AnswerKeyComparison({ config, primaryAnswers, onAnswerChange }: AnswerKeyComparisonProps) {
  const [secondaryAnswers, setSecondaryAnswers] = useState<Record<number, string>>({})
  const [comparisonName, setComparisonName] = useState("Comparison Answer Key")
  const [importText, setImportText] = useState("")

  const optionLetters = ["A", "B", "C", "D", "E"]

  const parseImportText = (text: string) => {
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

      setSecondaryAnswers(parsed)
    } catch (error) {
      console.error("Error parsing answers:", error)
    }
  }

  const clearSecondary = () => {
    setSecondaryAnswers({})
    setImportText("")
  }

  const copyFromPrimary = () => {
    setSecondaryAnswers({ ...primaryAnswers })
  }

  const exportComparison = () => {
    const differences = getDifferences()
    let csvContent = "Question,Primary Answer,Secondary Answer,Match\n"

    for (let i = 1; i <= config.numQuestions; i++) {
      const primary = primaryAnswers[i] || "-"
      const secondary = secondaryAnswers[i] || "-"
      const match = primary === secondary ? "Yes" : "No"
      csvContent += `${i},${primary},${secondary},${match}\n`
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `answer_key_comparison_${config.uniqueId}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getDifferences = () => {
    const differences: Array<{
      question: number
      primary: string
      secondary: string
    }> = []

    for (let i = 1; i <= config.numQuestions; i++) {
      const primary = primaryAnswers[i]
      const secondary = secondaryAnswers[i]

      if (primary && secondary && primary !== secondary) {
        differences.push({
          question: i,
          primary,
          secondary,
        })
      }
    }

    return differences
  }

  const getStatistics = () => {
    const primaryCount = Object.keys(primaryAnswers).length
    const secondaryCount = Object.keys(secondaryAnswers).length
    const differences = getDifferences()
    const matches = Math.min(primaryCount, secondaryCount) - differences.length

    return {
      primaryCount,
      secondaryCount,
      matches,
      differences: differences.length,
      accuracy: secondaryCount > 0 ? Math.round((matches / Math.min(primaryCount, secondaryCount)) * 100) : 0,
    }
  }

  const statistics = getStatistics()
  const differences = getDifferences()

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="glass-card border-0">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white flex items-center gap-2">
            <GitCompare size={20} />
            Answer Key Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="comparison-name" className="text-gray-300">
              Comparison Name
            </Label>
            <Input
              id="comparison-name"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              className="bg-black/40 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-secondary" className="text-gray-300">
              Import Secondary Answer Key
            </Label>
            <Textarea
              id="import-secondary"
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                parseImportText(e.target.value)
              }}
              placeholder="Paste answers here (CSV, plain text, or space-separated)..."
              className="h-32 bg-black/40 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={copyFromPrimary}
              className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
            >
              Copy Primary
            </Button>
            <Button
              variant="outline"
              onClick={clearSecondary}
              className="border-gray-700 hover:border-[#0070f3] text-gray-300 hover:text-white"
            >
              Clear Secondary
            </Button>
          </div>

          <div className="bg-[#0070f3]/10 p-4 rounded-lg border border-[#0070f3]/20">
            <h3 className="font-medium mb-3 text-white">Comparison Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Primary Answers:</span>
                <span className="ml-2 text-white font-medium">{statistics.primaryCount}</span>
              </div>
              <div>
                <span className="text-gray-300">Secondary Answers:</span>
                <span className="ml-2 text-white font-medium">{statistics.secondaryCount}</span>
              </div>
              <div>
                <span className="text-gray-300">Matches:</span>
                <span className="ml-2 text-green-400 font-medium">{statistics.matches}</span>
              </div>
              <div>
                <span className="text-gray-300">Differences:</span>
                <span className="ml-2 text-red-400 font-medium">{statistics.differences}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#0070f3]/20">
              <span className="text-gray-300">Accuracy:</span>
              <span className="ml-2 text-[#0070f3] font-bold text-lg">{statistics.accuracy}%</span>
            </div>
          </div>

          {differences.length > 0 && (
            <Alert className="bg-amber-900/20 border-amber-900/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-amber-200">
                  <p className="font-medium mb-2">{differences.length} differences found:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {differences.map(({ question, primary, secondary }) => (
                      <div key={question} className="text-xs">
                        Q{question}: {primary} → {secondary}
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-[#0070f3] hover:bg-[#0060d3]"
            onClick={exportComparison}
            disabled={Object.keys(secondaryAnswers).length === 0}
          >
            <Download size={16} className="mr-2" />
            Export Comparison
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white">Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 text-xs font-bold mb-2 sticky top-0 bg-black/80 p-2 rounded">
              <div className="text-gray-300">Q#</div>
              <div className="text-blue-400">Primary</div>
              <div className="text-purple-400">Secondary</div>
              <div className="text-gray-300">Match</div>
            </div>

            <div className="space-y-1">
              {Array.from({ length: config.numQuestions }, (_, i) => {
                const questionNum = i + 1
                const primary = primaryAnswers[questionNum]
                const secondary = secondaryAnswers[questionNum]
                const match = primary && secondary ? primary === secondary : null

                return (
                  <div
                    key={questionNum}
                    className={`grid grid-cols-4 gap-2 text-sm p-2 rounded ${
                      match === false ? "bg-red-900/20 border border-red-900/50" : "bg-black/20"
                    }`}
                  >
                    <div className="text-gray-300 font-medium">{questionNum}</div>
                    <div className="text-blue-400">{primary || "-"}</div>
                    <div className="text-purple-400">{secondary || "-"}</div>
                    <div>
                      {match === true && (
                        <Badge className="bg-green-900/30 text-green-400 border-green-900/50">✓</Badge>
                      )}
                      {match === false && <Badge className="bg-red-900/30 text-red-400 border-red-900/50">✗</Badge>}
                      {match === null && (
                        <Badge variant="outline" className="border-gray-700 text-gray-500">
                          -
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
