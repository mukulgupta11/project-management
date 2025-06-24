import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';


const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if(response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // download task report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again later")
    }
  }

  useEffect(()=>{
    getAllUsers()
  }, [])
  return (
    <DashboardLayout activeMenu={"Team Members"}>
      <div className='mt-5 mb-10'>
        <div className='flex md:flex-row md:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>Team Members</h2>
          <button className='flex md:flex download-btn' onClick={handleDownloadReport}>
            <LuFileSpreadsheet className='text-lg' />
            Download Report
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {allUsers?.map((user) => (
            <div key={user._id} className="relative">
        <UserCard userInfo={user} taskCounts={user.taskCounts} />
        <button
          className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
          onClick={async () => {
            if(window.confirm('Are you sure you want to delete this user?')) {
              try {
                await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(user._id));
                setAllUsers(prev => prev.filter(u => u._id !== user._id));
                toast.success('User deleted successfully');
              } catch {
                toast.error('Failed to delete user');
              }
            }
          }}
        >
          Delete
        </button>
      </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
