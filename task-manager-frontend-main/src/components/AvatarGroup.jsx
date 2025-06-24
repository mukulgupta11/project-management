import React from 'react';
import { BASE_URL } from '../utils/apiPaths';
import blank_user from '../assets/image/blank_user.jpg'; // Note: Adjust this path if your folder structure is different

const AvatarGroup = ({ avatars, maxVisible = 3 }) => {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img
          key={index}
          src={avatar ? `${BASE_URL}${avatar}` : blank_user}
          alt={`Avatar ${index}`}
          className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0 object-cover"
        />
      ))}
      {avatars.length > maxVisible && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;