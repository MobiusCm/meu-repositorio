"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Smile, Frown, Meh } from "lucide-react"

export function SentimentAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    sentiment: "positive" | "neutral" | "negative"
    score: number
    summary: string
  }>(null)

  const runAnalysis = () => {
    setIsAnalyzing(true)

    // Simulate API call to sentiment analysis endpoint
    setTimeout(() => {
      setIsAnalyzing(false)
      setResult({
        sentiment: "positive",
        score: 78,
        summary:
          "The group conversation has a predominantly positive tone. Members are engaged and supportive, with frequent expressions of enthusiasm about upcoming events. There are occasional neutral exchanges about logistics and planning, but very few negative interactions. The overall sentiment indicates a healthy and collaborative community.",
      })
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
        <p className="text-sm text-muted-foreground">Analyze the emotional tone of your group conversations</p>
      </div>

      {isAnalyzing ? (
        <div className="space-y-4">
          <Progress value={45} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">Analyzing conversation sentiment...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            {result.sentiment === "positive" ? (
              <div className="bg-green-100 p-4 rounded-full">
                <Smile className="h-12 w-12 text-green-600" />
              </div>
            ) : result.sentiment === "neutral" ? (
              <div className="bg-blue-100 p-4 rounded-full">
                <Meh className="h-12 w-12 text-blue-600" />
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded-full">
                <Frown className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h4 className="font-medium mb-1">
              {result.sentiment === "positive"
                ? "Positive Sentiment"
                : result.sentiment === "neutral"
                  ? "Neutral Sentiment"
                  : "Negative Sentiment"}
            </h4>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Progress value={result.score} className="h-2 w-32" />
              <span className="text-sm font-medium">{result.score}%</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <p className="text-sm">{result.summary}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button onClick={runAnalysis}>Run Sentiment Analysis</Button>
        </div>
      )}
    </div>
  )
}
