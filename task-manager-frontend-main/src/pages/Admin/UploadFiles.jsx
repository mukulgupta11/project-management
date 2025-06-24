import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const UploadFiles = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState({}); // { taskId: [files] }
  const [uploading, setUploading] = useState({}); // { taskId: bool }

  useEffect(() => {
    // Fetch all tasks for admin
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.log(err)
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Fetch attachments for a task
  const fetchAttachments = async (taskId) => {
    try {
      const res = await axios.get(`/api/attachments/${taskId}`);
      setAttachments((prev) => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      console.log(err)
      setAttachments((prev) => ({ ...prev, [taskId]: [] }));
    }
  };

  // Fetch attachments for all tasks on mount
  useEffect(() => {
    tasks.forEach((task) => {
      fetchAttachments(task._id);
    });
  }, [tasks]);

  // Handle file upload
  const handleUpload = async (taskId, e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading((prev) => ({ ...prev, [taskId]: true }));
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    try {
      await axios.post(`/api/attachments/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchAttachments(taskId);
      e.target.value = '';
    } catch (err) {
      console.log(err)
      alert('Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Handle file download
  const handleDownload = async (attachmentId, originalName) => {
    try {
      const res = await axios.get(`/api/attachments/download/${attachmentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err)
      alert('Download failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <DashboardLayout activeMenu="Upload Files">
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Upload & Download Files for Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500">No tasks found.</div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task._id} className="card shadow-md border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleUpload(task._id, e)}
                      disabled={uploading[task._id]}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                    />
                    {uploading[task._id] && <span className="text-xs text-blue-500 ml-2">Uploading...</span>}
                  </div>
                </div>
                <div className="mt-3">
                  <strong className="text-sm text-gray-700">Attachments:</strong>
                  <ul className="mt-2 space-y-1">
                    {(attachments[task._id] || []).length === 0 ? (
                      <li className="text-xs text-gray-400">No files uploaded.</li>
                    ) : (
                      attachments[task._id].map((file) => (
                        <li key={file._id} className="flex items-center gap-2 text-sm text-gray-800">
                          <span className="truncate max-w-xs">{file.originalName}</span>
                          <button
                            onClick={() => handleDownload(file._id, file.originalName)}
                            className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Download
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UploadFiles; 