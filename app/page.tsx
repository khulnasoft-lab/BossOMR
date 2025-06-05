import { OMRSheetGenerator } from "@/components/omr-sheet-generator"

export default function Home() {
  return (
    <main className="min-h-screen grid-pattern py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">OMR Sheet Generator</h1>
          <p className="text-gray-400 text-center max-w-2xl">
            Create customizable optical mark recognition sheets for exams, surveys, and assessments
          </p>
        </div>
        <OMRSheetGenerator />
      </div>
    </main>
  )
}
