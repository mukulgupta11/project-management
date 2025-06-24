import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import toast from "react-hot-toast"

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

 const getAllTasks = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);

    const all = response.data?.tasks || [];

    // Create status counts
    const summary = {
      all: all.length,
      pendingTask: all.filter(t => t.status === "Pending").length,
      inProgressTask: all.filter(t => t.status === "In Progress").length,
      unverified: all.filter(t => t.status === "Unverified").length,
      completedTask: all.filter(t => t.status === "Completed").length,
    };

    const statusArray = [
      { label: "All", count: summary.all },
      { label: "Pending", count: summary.pendingTask },
      { label: "In Progress", count: summary.inProgressTask },
      { label: "Unverified", count: summary.unverified },
      { label: "Completed", count: summary.completedTask },
    ];

    setTabs(statusArray);

    // Apply filter for display
    const filteredTasks = filterStatus === "All"
      ? all
      : all.filter(t => t.status === filterStatus);

    setAllTasks(filteredTasks);

  } catch (error) {
    console.error("error fetching tasks", error);
  }
};


  const handleClick = (taskData) => {
    navigate("/admin/create-task", {state: {taskId: taskData._id}});
  };

   async function handleVerifyTask(taskId) {
    try {
      await axiosInstance.put(`/api/tasks/${taskId}/verify`);
      toast.success("Task verified successfully");
      getAllTasks(filterStatus);
    } catch (error) {
      console.error("Error verifying task:", error);
      toast.error("Failed to verify task. Please try again.");
    }
  }

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  }

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);
  
  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-xl md:text-xl font-medium'>Manage Tasks</h2>
            <button onClick={handleDownloadReport} className='flex lg:hidden download-btn'>
              <LuFileSpreadsheet className='text-lg' />
              Download Reports
            </button>
          </div>
          {tabs?.[0]?.count > 0 && (
            <div className='flex items-center gap-3'>
              <TaskStatusTabs
               tabs={tabs}
               activeTab={filterStatus}
               setActiveTab={setFilterStatus}
              />
              <button className='hidden md:flex download-btn' onClick={handleDownloadReport}>
                <LuFileSpreadsheet className='text-lg' />
                Download Reports
              </button>
            </div>
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {allTasks?.map((item, index) => (
            <TaskCard
          key={item._id}
          isAdmin={true}
          title={item.title}
          description={item.description}
          priority={item.priority}
          status={item.status}
          progress={item.progress}
          createdAt={item.createdAt}
          dueDate={item.dueDate}
          assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
          attachmentCount={(item.attachments?.length) || 0}
          completedTodoCount={item.completedTodoCount || 0}
          todoCheckList={item.todoCheckList || []}
          onClick={() => {
            handleClick(item);
          }}
          handleVerify={() => handleVerifyTask(item._id)}
        />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageTasks
