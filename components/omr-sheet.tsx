"use client"

interface OMRSheetProps {
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

export function OMRSheet({ config }: OMRSheetProps) {
  const optionLetters = ["A", "B", "C", "D", "E"]

  return (
    <div className="w-full bg-white p-8 print:p-4 print:shadow-none">
      <div className="border-2 border-black p-6 print:p-4">
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-sm mt-1">Sheet ID: {config.uniqueId}</p>
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
          <h2 className="font-bold mb-4 text-center">Answer Sheet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
            {Array.from({ length: config.numQuestions }, (_, i) => (
              <div key={i} className="flex items-center mb-1">
                <span className="font-medium mr-2 w-7 text-right">{i + 1}.</span>
                <div className="flex space-x-3">
                  {Array.from({ length: config.optionsPerQuestion }, (_, j) => (
                    <div key={j} className="flex items-center">
                      <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center">
                        {optionLetters[j]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
