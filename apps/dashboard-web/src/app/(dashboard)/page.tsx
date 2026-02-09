export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-2xl font-bold mt-1">$0.00</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Supporters</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Active Initiatives</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Open Tasks</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
