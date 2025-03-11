'use client';

import DashboardLayout from '../components/DashboardLayout';
import { Card, Text, Metric, Title } from '@tremor/react';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <Text>Total Ratings</Text>
            <Metric>123</Metric>
          </Card>
          <Card>
            <Text>Pending Reviews</Text>
            <Metric>5</Metric>
          </Card>
          <Card>
            <Text>Average Rating</Text>
            <Metric>4.2</Metric>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <Title>Recent Activity</Title>
            <div className="mt-4">
              {/* Add activity list here */}
              <p className="text-gray-500">No recent activity</p>
            </div>
          </Card>
          <Card>
            <Title>System Status</Title>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 