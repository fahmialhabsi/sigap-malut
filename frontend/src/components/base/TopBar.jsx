import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

export default function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">🏛️ SIGAP Malut</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search..."
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center gap-2 border-l pl-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                {user?.nama_lengkap || "User"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role || "Staff"}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <span className="text-xl">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
