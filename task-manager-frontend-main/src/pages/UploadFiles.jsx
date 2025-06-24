// src/pages/UploadFiles.jsx
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";

const UploadFiles = () => {
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks based on role
    const fetchTasks = async () => {
      const endpoint = user.role === "admin" ? "/tasks" : `/tasks?assignedTo=${user.id}`;
      const res = await axiosInstance.get(endpoint);
      setTasks(res.data);
    };
    fetchTasks();
  }, [user]);

  const handleFileUpload = async (taskId, files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));
    await axiosInstance.post(`/tasks/${taskId}/upload`, formData);
    // Refresh tasks/files after upload
  };

  return (
    <div>
      <h2>Upload Files</h2>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <input
            type="file"
            multiple
            onChange={e => handleFileUpload(task.id, e.target.files)}
          />
          <ul>
            {task.files?.map(file => (
              <li key={file.id}>
                <a href={file.url} download>{file.name}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UploadFiles;