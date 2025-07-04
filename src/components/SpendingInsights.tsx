"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpendingInsight } from '@/types/budget';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SpendingInsightsProps {
  insights: SpendingInsight[];
}

export function SpendingInsights({ insights }: SpendingInsightsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'info':
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            Set up budgets to get personalized spending insights
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getCardStyle(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{insight.icon}</span>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-700">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
