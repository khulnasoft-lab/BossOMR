"use client"

import { QRCodeSVG } from "qrcode.react"

interface OMRGridSheetProps {
  config: {
    title: string
    numQuestions: number
    optionsPerQuestion: number
    showRollNumber: boolean
    showName: boolean
    showInstructions: boolean
    uniqueId: string
  }
}

export function OMRGridSheet({ config }: OMRGridSheetProps) {
  const optionLetters = ["A", "B", "C", "D", "E"]
  const questionsPerRow = 10
  const rows = Math.ceil(config.numQuestions / questionsPerRow)

  const qrData = JSON.stringify({
    id: config.uniqueId,
    title: config.title,
    questions: config.numQuestions,
    options: config.optionsPerQuestion,
    format: "grid",
  })

  return (
    <div className="w-full bg-white p-8 print:p-4 print:shadow-none">
      <div className="border-2 border-black p-6 print:p-4">
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-sm mt-1">Sheet ID: {config.uniqueId} | Grid Format</p>
          </div>
          <div className="ml-4">
            <QRCodeSVG value={qrData} size={60} />
          </div>
        </div>

        {(config.showName || config.showRollNumber) && (
          <div className="border-b-2 border-black py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.showName && (
              <div className="flex items-center">
                <span className="font-bold mr-2 min-w-[80px]">Name:</span>
                <div className="border border-black flex-1 h-8"></div>
              </div>
            )}
            {config.showRollNumber && (
              <div className="flex items-center">
                <span className="font-bold mr-2 min-w-[80px]">Roll No:</span>
                <div className="border border-black flex-1 h-8"></div>
              </div>
            )}
          </div>
        )}

        {config.showInstructions && (
          <div className="border-b-2 border-black py-4">
            <h2 className="font-bold mb-2">Instructions:</h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Use blue or black ball point pen only.</li>
              <li>Completely darken the bubble corresponding to your answer.</li>
              <li>Marking multiple bubbles for a question will invalidate the answer.</li>
              <li>Ensure your markings are dark and completely fill the bubble.</li>
              <li>Do not make any stray marks on the sheet.</li>
            </ul>
          </div>
        )}

        <div className="py-4">
          <h2 className="font-bold mb-4 text-center">Answer Grid</h2>

          {/* Grid Header */}
          <div className="grid grid-cols-11 gap-1 mb-2 text-xs font-bold">
            <div className="text-center">Q#</div>
            {optionLetters.slice(0, config.optionsPerQuestion).map((letter) => (
              <div key={letter} className="text-center">
                {letter}
              </div>
            ))}
          </div>

          {/* Answer Grid */}
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="mb-6">
              <div className="grid gap-2">
                {Array.from({ length: questionsPerRow }, (_, colIndex) => {
                  const questionNum = rowIndex * questionsPerRow + colIndex + 1
                  if (questionNum > config.numQuestions) return null

                  return (
                    <div key={questionNum} className="grid grid-cols-11 gap-1 items-center">
                      <div className="text-center font-medium text-sm">{questionNum}</div>
                      {optionLetters.slice(0, config.optionsPerQuestion).map((letter) => (
                        <div key={letter} className="flex justify-center">
                          <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Timing marks for scanning */}
        <div className="border-t-2 border-black pt-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex space-x-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="w-2 h-2 bg-black rounded-full"></div>
              ))}
            </div>
            <span>Scan ID: {config.uniqueId}</span>
            <div className="flex space-x-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="w-2 h-2 bg-black rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
