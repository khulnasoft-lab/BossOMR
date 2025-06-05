"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Target, Award, AlertTriangle, CheckCircle } from "lucide-react"

interface StudentResponse {
  id: string
  name: string
  rollNumber: string
  responses: Record<number, string>
  score: number
  percentage: number
  timestamp: Date
}

interface AnalyticsDashboardProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    uniqueId: string
  }
  answerKey: Record<number, string>
  studentResponses: StudentResponse[]
}

export function AnalyticsDashboard({ config, answerKey, studentResponses }: AnalyticsDashboardProps) {
  const optionLetters = ["A", "B", "C", "D", "E"]

  const getScoreDistribution = () => {
    const ranges = [
      { range: "0-20%", min: 0, max: 20, count: 0 },
      { range: "21-40%", min: 21, max: 40, count: 0 },
      { range: "41-60%", min: 41, max: 60, count: 0 },
      { range: "61-80%", min: 61, max: 80, count: 0 },
      { range: "81-100%", min: 81, max: 100, count: 0 },
    ]

    studentResponses.forEach((response) => {
      const range = ranges.find((r) => response.percentage >= r.min && response.percentage <= r.max)
      if (range) range.count++
    })

    return ranges
  }

  const getQuestionAnalysis = () => {
    const analysis: Array<{
      question: number
      correctAnswers: number
      incorrectAnswers: number
      difficulty: string
      optionDistribution: Record<string, number>
    }> = []

    for (let i = 1; i <= config.numQuestions; i++) {
      const correctAnswer = answerKey[i]
      let correctCount = 0
      let incorrectCount = 0
      const optionDistribution: Record<string, number> = {}

      // Initialize option distribution
      optionLetters.slice(0, config.optionsPerQuestion).forEach((option) => {
        optionDistribution[option] = 0
      })

      studentResponses.forEach((response) => {
        const studentAnswer = response.responses[i]
        if (studentAnswer) {
          optionDistribution[studentAnswer] = (optionDistribution[studentAnswer] || 0) + 1

          if (correctAnswer && studentAnswer === correctAnswer) {
            correctCount++
          } else {
            incorrectCount++
          }
        }
      })

      const totalResponses = correctCount + incorrectCount
      const difficultyPercentage = totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0

      let difficulty = "Easy"
      if (difficultyPercentage < 30) difficulty = "Hard"
      else if (difficultyPercentage < 70) difficulty = "Medium"

      analysis.push({
        question: i,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        difficulty,
        optionDistribution,
      })
    }

    return analysis
  }

  const getAnswerKeyDistribution = () => {
    const distribution: Record<string, number> = {}

    optionLetters.slice(0, config.optionsPerQuestion).forEach((option) => {
      distribution[option] = 0
    })

    Object.values(answerKey).forEach((answer) => {
      distribution[answer] = (distribution[answer] || 0) + 1
    })

    return Object.entries(distribution).map(([option, count]) => ({
      option,
      count,
    }))
  }

  const getPerformanceTrend = () => {
    return studentResponses
      .slice()
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((response, index) => ({
        submission: index + 1,
        percentage: response.percentage,
        name: response.name,
      }))
  }

  const getTopPerformers = () => {
    return studentResponses
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
  }

  const getStatistics = () => {
    if (studentResponses.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        totalStudents: 0,
      }
    }

    const scores = studentResponses.map((r) => r.percentage)
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const passRate = Math.round((scores.filter((score) => score >= 60).length / scores.length) * 100)

    return {
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      totalStudents: studentResponses.length,
    }
  }

  const scoreDistribution = getScoreDistribution()
  const questionAnalysis = getQuestionAnalysis()
  const answerKeyDistribution = getAnswerKeyDistribution()
  const performanceTrend = getPerformanceTrend()
  const topPerformers = getTopPerformers()
  const statistics = getStatistics()

  const COLORS = ["#0070f3", "#00d4aa", "#ff6b6b", "#ffd93d", "#6c5ce7"]

  const hardQuestions = questionAnalysis.filter((q) => q.difficulty === "Hard").slice(0, 5)
  const easyQuestions = questionAnalysis.filter((q) => q.difficulty === "Easy").slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#0070f3]" />
              <div>
                <div className="text-2xl font-bold text-white">{statistics.totalStudents}</div>
                <div className="text-xs text-gray-400">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{statistics.averageScore}%</div>
                <div className="text-xs text-gray-400">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{statistics.highestScore}%</div>
                <div className="text-xs text-gray-400">Highest Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-white">{statistics.lowestScore}%</div>
                <div className="text-xs text-gray-400">Lowest Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-[#0070f3]" />
              <div>
                <div className="text-2xl font-bold text-white">{statistics.passRate}%</div>
                <div className="text-xs text-gray-400">Pass Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="count" fill="#0070f3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Answer Key Distribution */}
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Answer Key Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={answerKeyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ option, count }) => `${option}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {answerKeyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      {performanceTrend.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp size={20} />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="submission" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#0070f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {topPerformers.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No data available</p>
              ) : (
                topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-[#0070f3]/20 text-[#0070f3] border-[#0070f3]/30">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-xs text-gray-400">Roll: {student.rollNumber}</div>
                      </div>
                    </div>
                    <Badge className="bg-green-900/30 text-green-400 border-green-900/50">{student.percentage}%</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Difficult Questions */}
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Most Difficult Questions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {hardQuestions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No difficult questions identified</p>
              ) : (
                hardQuestions.map((question) => (
                  <div key={question.question} className="bg-black/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">Question {question.question}</span>
                      <Badge className="bg-red-900/30 text-red-400 border-red-900/50">{question.difficulty}</Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      Correct: {question.correctAnswers} | Incorrect: {question.incorrectAnswers}
                    </div>
                    <div className="text-xs text-gray-400">
                      Success Rate:{" "}
                      {question.correctAnswers + question.incorrectAnswers > 0
                        ? Math.round(
                            (question.correctAnswers / (question.correctAnswers + question.incorrectAnswers)) * 100,
                          )
                        : 0}
                      %
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Easy Questions */}
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Easiest Questions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {easyQuestions.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No easy questions identified</p>
              ) : (
                easyQuestions.map((question) => (
                  <div key={question.question} className="bg-black/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">Question {question.question}</span>
                      <Badge className="bg-green-900/30 text-green-400 border-green-900/50">
                        {question.difficulty}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      Correct: {question.correctAnswers} | Incorrect: {question.incorrectAnswers}
                    </div>
                    <div className="text-xs text-gray-400">
                      Success Rate:{" "}
                      {question.correctAnswers + question.incorrectAnswers > 0
                        ? Math.round(
                            (question.correctAnswers / (question.correctAnswers + question.incorrectAnswers)) * 100,
                          )
                        : 0}
                      %
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question-wise Analysis */}
      {questionAnalysis.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Question-wise Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2 text-xs font-bold mb-2 sticky top-0 bg-black/80 p-2 rounded">
                <div className="text-gray-300">Question</div>
                <div className="text-green-400">Correct</div>
                <div className="text-red-400">Incorrect</div>
                <div className="text-yellow-400">Success Rate</div>
                <div className="text-purple-400">Difficulty</div>
                <div className="text-blue-400">Answer Key</div>
              </div>

              <div className="space-y-1">
                {questionAnalysis.map((question) => {
                  const totalResponses = question.correctAnswers + question.incorrectAnswers
                  const successRate =
                    totalResponses > 0 ? Math.round((question.correctAnswers / totalResponses) * 100) : 0

                  return (
                    <div key={question.question} className="grid grid-cols-6 gap-2 text-sm p-2 rounded bg-black/20">
                      <div className="text-gray-300 font-medium">{question.question}</div>
                      <div className="text-green-400">{question.correctAnswers}</div>
                      <div className="text-red-400">{question.incorrectAnswers}</div>
                      <div className="text-yellow-400">{successRate}%</div>
                      <div>
                        <Badge
                          className={
                            question.difficulty === "Easy"
                              ? "bg-green-900/30 text-green-400 border-green-900/50"
                              : question.difficulty === "Medium"
                                ? "bg-yellow-900/30 text-yellow-400 border-yellow-900/50"
                                : "bg-red-900/30 text-red-400 border-red-900/50"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                      <div className="text-blue-400 font-medium">{answerKey[question.question] || "-"}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
