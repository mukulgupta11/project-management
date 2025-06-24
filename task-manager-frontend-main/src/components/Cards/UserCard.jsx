import React from 'react';
import { BASE_URL } from '../../utils/apiPaths';
import blank_user from '../../assets/image/blank_user.jpg';

const UserCard = ({ userInfo }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={userInfo.profileImageUrl ? `${BASE_URL}${userInfo.profileImageUrl}` : blank_user}
              alt={userInfo.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.username}</p>
            </div>
          </div>
          
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard label="Pending" count={userInfo.pendingTasks || 0} color="violet" />
          <StatCard label="In Progress" count={userInfo.inProgressTasks || 0} color="cyan" />
          <StatCard label="Unverified" count={userInfo.unverifiedTasks || 0} color="yellow" />
          <StatCard label="Completed" count={userInfo.completedTasks || 0} color="indigo" />
        </div>
      </div>
    </div>
  );
};

export default UserCard;

const StatCard = ({ label, count, color }) => {
  const colors = {
    violet: 'text-violet-500 bg-violet-50',
    cyan: 'text-cyan-500 bg-cyan-50',
    yellow: 'text-yellow-500 bg-yellow-50',
    indigo: 'text-indigo-500 bg-indigo-50',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color]}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
};