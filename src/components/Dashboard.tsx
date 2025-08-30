// Protected dashboard page with user data and metrics
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, User, TrendingUp, Users, DollarSign, Activity, Calendar, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  
  // Debug function to check user data
  const checkUserData = async () => {
    try {
      // Check current session
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      // Check profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      console.log('Profiles:', profiles, 'Error:', profileError);
      
      // Check auth users (this might not work due to RLS)
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*');
      console.log('Auth users:', authUsers, 'Error:', authError);
      
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  // Mock data for charts and metrics
  const chartData = [
    { month: 'Jan', revenue: 4000, users: 240 },
    { month: 'Feb', revenue: 3000, users: 139 },
    { month: 'Mar', revenue: 5000, users: 980 },
    { month: 'Apr', revenue: 2780, users: 390 },
    { month: 'May', revenue: 1890, users: 480 },
    { month: 'Jun', revenue: 2390, users: 380 },
  ];

  const recentActivity = [
    { id: 1, action: 'User Registration', time: '2 minutes ago', status: 'success' },
    { id: 2, action: 'Payment Processed', time: '5 minutes ago', status: 'success' },
    { id: 3, action: 'Profile Updated', time: '1 hour ago', status: 'info' },
    { id: 4, action: 'Login Attempt', time: '2 hours ago', status: 'warning' },
    { id: 5, action: 'Data Export', time: '1 day ago', status: 'success' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-slate-300">
                <User className="h-5 w-5" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={checkUserData}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                title="Debug user data"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Debug</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-slate-400">Here's what's happening with your account today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$18,060</p>
                <p className="text-green-400 text-sm mt-1">+12% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-white">2,609</p>
                <p className="text-blue-400 text-sm mt-1">+8% from last week</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Growth Rate</p>
                <p className="text-2xl font-bold text-white">24.7%</p>
                <p className="text-purple-400 text-sm mt-1">+3.2% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-white">573</p>
                <p className="text-orange-400 text-sm mt-1">+19% from last month</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <button className="text-slate-400 hover:text-slate-300 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Email Address</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Member Since</p>
              <p className="text-white font-medium">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;