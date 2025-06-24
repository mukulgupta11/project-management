import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';

const MyTasks = () => {
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

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    //return () => {};
  }, [filterStatus]);
  
  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
          <h2 className='text-xl md:text-xl font-medium'>My Tasks</h2>
          {tabs?.[0]?.count > 0 && (
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {allTasks?.map((item, index) => (
            <TaskCard
          key={item._id}
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
            handleClick(item._id);
          }}
        />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTasks
