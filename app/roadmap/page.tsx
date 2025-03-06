import TodoList from '../components/TodoList';

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Burrito Rater Roadmap</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Track the development progress and upcoming features of the Burrito Rater application.
          Filter by status and priority to see what's coming next.
        </p>
        <TodoList />
      </div>
    </div>
  );
} 