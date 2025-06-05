"use client"

interface AnswerKeyProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    uniqueId: string
  }
  answers: Record<number, string>
}

export function AnswerKey({ config, answers }: AnswerKeyProps) {
  const answeredQuestions = Object.keys(answers).length

  return (
    <div className="w-full bg-white p-8 print:p-4 print:shadow-none">
      <div className="border-2 border-black p-6 print:p-4">
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">ANSWER KEY</h1>
          <h2 className="text-lg font-medium mt-1">{config.title}</h2>
          <p className="text-sm mt-1">Sheet ID: {config.uniqueId}</p>
          <p className="text-sm text-gray-600">
            {answeredQuestions} of {config.numQuestions} questions answered
          </p>
        </div>

        <div className="py-6">
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-8 gap-y-2">
            {Array.from({ length: config.numQuestions }, (_, i) => {
              const questionNum = i + 1
              const answer = answers[questionNum]

              return (
                <div key={questionNum} className="flex items-center justify-between">
                  <span className="font-medium text-sm mr-2">{questionNum}.</span>
                  <div
                    className={`w-8 h-6 rounded flex items-center justify-center text-sm font-bold ${
                      answer
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-400 border border-gray-300"
                    }`}
                  >
                    {answer || "-"}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {answeredQuestions > 0 && (
          <div className="border-t-2 border-black pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-bold">Total Questions:</span> {config.numQuestions}
              </div>
              <div>
                <span className="font-bold">Answered:</span> {answeredQuestions}
              </div>
              <div>
                <span className="font-bold">Options:</span> {config.optionsPerQuestion}
              </div>
              <div>
                <span className="font-bold">Generated:</span> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
