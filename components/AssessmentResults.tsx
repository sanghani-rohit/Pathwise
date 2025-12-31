'use client'

import React from 'react'
import { EvaluationResult, EvaluationSummary } from '@/lib/types/database'

interface AssessmentResultsProps {
  summary: EvaluationSummary
  results: EvaluationResult[]
  showDetailedResults?: boolean
}

export default function AssessmentResults({
  summary,
  results,
  showDetailedResults = true
}: AssessmentResultsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 bg-green-50'
      case 'wrong':
        return 'text-red-600 bg-red-50'
      case 'skipped':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return '✓'
      case 'wrong':
        return '✗'
      case 'skipped':
        return '○'
      default:
        return '?'
    }
  }

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return '🎉 Excellent! Outstanding performance!'
    if (percentage >= 75) return '👏 Great job! Very good performance!'
    if (percentage >= 60) return '✅ Good work! Keep it up!'
    if (percentage >= 50) return '📚 Not bad! Room for improvement.'
    return '💪 Keep learning! Practice makes perfect!'
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'current_skills':
        return 'Current Skills'
      case 'strong_skills':
        return 'Strong Skills'
      case 'weak_skills':
        return 'Skills to Improve'
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Results</h2>

        {/* Score Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {summary.percentage}%
            </div>
            <div className="text-xl text-gray-600">
              {summary.score} / {summary.maxScore} points
            </div>
            <div className="text-lg text-gray-700 mt-2">
              {getPerformanceMessage(summary.percentage)}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">{summary.correctCount}</div>
            <div className="text-sm text-gray-600 mt-1">Correct</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600">{summary.wrongCount}</div>
            <div className="text-sm text-gray-600 mt-1">Wrong</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-gray-600">{summary.skippedCount}</div>
            <div className="text-sm text-gray-600 mt-1">Skipped</div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetailedResults && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Results</h3>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={result.questionId}
                className={`p-4 rounded-lg border-2 ${
                  result.status === 'correct'
                    ? 'border-green-200 bg-green-50'
                    : result.status === 'wrong'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                      </span>
                      <span className="text-sm font-semibold text-gray-500">
                        Question {index + 1}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {getCategoryLabel(result.category)}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {result.skill}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{result.question}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-sm font-bold text-gray-700">
                      {result.marksAwarded} / 1
                    </span>
                  </div>
                </div>

                {/* Your Answer */}
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-600">Your Answer:</span>
                  <p className="text-gray-700 mt-1 pl-4 border-l-2 border-gray-300">
                    {result.userAnswer}
                  </p>
                </div>

                {/* Correct Answer (if wrong or skipped) */}
                {(result.status === 'wrong' || result.status === 'skipped') && result.correctAnswer && (
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-green-700">Correct Answer:</span>
                    <p className="text-gray-700 mt-1 pl-4 border-l-2 border-green-400">
                      {result.correctAnswer}
                    </p>
                  </div>
                )}

                {/* Explanation (if wrong or skipped) */}
                {(result.status === 'wrong' || result.status === 'skipped') && result.explanation && (
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">💡 Explanation:</span>
                    <p className="text-gray-700 mt-1 text-sm">{result.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
