export function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
          <p className="text-gray-400">Manage your account settings and preferences.</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
          <div className="space-y-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Export All Data (CSV)
            </button>
            <p className="text-gray-400 text-sm">Download all your job applications as a CSV file.</p>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
          <button className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
