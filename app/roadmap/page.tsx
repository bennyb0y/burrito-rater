import TodoList from '../components/TodoList';

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-8 text-gray-900">
          Burrito Rater Roadmap
        </h1>
        <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Track the development progress and upcoming features of the Burrito Rater application.
          Filter by status and priority to see what's coming next.
        </p>
        <TodoList />
      </div>
    </div>
  );
} 