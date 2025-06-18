import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from './../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState([])
  const [adminCount, setAdminCount] = useState(0);

  const [userData, setUserData] = useState([])
  const [userCount, setUserCount] = useState(0);

  const [taskData, setTaskData] = useState([])
  const [taskCount, setTaskCount] = useState(0);

  const [disabledTaskData, setDisabledTaskData] = useState([])
  const [disabledTaskCount, setDisabledTaskCount] = useState(0);

  // New state variables for pending and completed tasks
  const [pendingTaskData, setPendingTaskData] = useState([]);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [completedTaskData, setCompletedTaskData] = useState([]);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);

  // State for users with task assignments
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFilteredUser, setSelectedFilteredUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);

  // State to track which card is selected
  const [selectedCard, setSelectedCard] = useState('admins');

  // Add sorting state
  const [sortDirection, setSortDirection] = useState('desc');

  // New state variables for task CRUD operations
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    content: '',
    category: '',
    status: 'pending'  // Changed from 'Pending' to 'pending' to match enum
  });
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // Admin count
  const fetchAdminCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/count`);
      setAdminCount(response.data.count);
    } catch (error) {
      console.log("Count error log", error);
    }
  };

  // User count
  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/count`);
      setUserCount(response.data.count);
    } catch (error) {
      console.log("Count error log", error);
    }
  };

  // Task count
  const fetchTaskCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/task/count`);
      setTaskCount(response.data.count);
    } catch (error) {
      console.log("Count error log", error);
    }
  };
  // Disabled Task Count
  const fetchDisableTaskCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/task/disableCount`);
      setDisabledTaskCount(response.data.count);
    } catch (error) {
      console.log("Count error log", error);
    }
  };

  // Count pending and completed tasks
  const countTasksByStatus = (tasks) => {
    const pending = tasks.filter(task => task.status === 'pending');
    const completed = tasks.filter(task => task.status === 'completed');

    setPendingTaskData(pending);
    setPendingTaskCount(pending.length);
    setCompletedTaskData(completed);
    setCompletedTaskCount(completed.length);
  };

  // Function to fetch users for task assignment dropdown
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/getUsers`);
      setUserOptions(response.data.userData);
    } catch (error) {
      console.log("Error fetching users for task assignment", error);
    }
  };

  // Function to fetch users who have assigned or been assigned tasks
  const fetchUsersWithTasks = async () => {
    try {
      const tasksResponse = await axios.get(`${BASE_URL}/task/getTask`);
      const allTasks = tasksResponse.data.taskData;

      const usersResponse = await axios.get(`${BASE_URL}/user/getUsers`);
      const allUsers = usersResponse.data.userData;

      const usersWithTasks = allUsers.filter(user => {
        const userCreatedTasks = allTasks.some(task =>
          task.userId && task.userId._id === user._id
        );

        const userAssignedTasks = allTasks.some(task =>
          task.assignedTo && task.assignedTo._id === user._id
        );

        return userCreatedTasks || userAssignedTasks;
      }).map(user => {
        const taskCount = allTasks.filter(task =>
          (task.userId && task.userId._id === user._id) ||
          (task.assignedTo && task.assignedTo._id === user._id)
        ).length;

        return { ...user, taskCount };
      });

      setFilteredUsers(usersWithTasks);
    } catch (error) {
      console.log("Error fetching users with tasks", error);
    }
  };

  // Function to fetch tasks for a specific user
  const fetchTasksForUser = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/task/getTask`);
      const allTasks = response.data.taskData;

      const userSpecificTasks = allTasks.filter(task =>
        task.assignedTo && task.assignedTo._id === userId
      );

      setUserTasks(userSpecificTasks);
      setSelectedFilteredUser(filteredUsers.find(user => user._id === userId));
    } catch (error) {
      console.log("Error fetching tasks for user", error);
    }
  };

  const handleUserClick = (userId) => {
    fetchTasksForUser(userId);
  };

  const clearSelectedUser = () => {
    setSelectedFilteredUser(null);
    setUserTasks([]);
  };

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      console.warn("No authentication token found. Redirecting to login...");
      // Redirect to login page if no token is found
      navigate('/');
      return;
    }

    if (userType !== 'admin') {
      console.warn("Unauthorized access attempt. Redirecting to appropriate page...");
      // Redirect non-admin users to task management
      navigate('/taskMangement');
      return;
    }

    fetchAdminCount();
    fetchUserCount();
    fetchTaskCount();
    fetchDisableTaskCount();
    getAdmins();
    fetchUsers();
  }, [navigate]); // Adding navigate to the dependency array

  const getAdmins = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/getAdmins`)
      setAdminData(response.data.AdminData)
      console.log("Admins data successfully fetched", response.data.AdminData);
    } catch (error) {
      console.log("-----Admin Data-----", error);
    }
  }

  // Show user Data
  const getUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/getUsers`)
      setUserData(response.data.userData)
      // console.log("Users data successfully fetched", userData.map((a) => { a }));
      console.log("userData", userData);
    } catch (error) {
      console.log("-----User Data-----", error);
    }
  }

  // Toggle user access
  const toggleUserAccess = async (userId, isDisabled) => {
    try {
      const response = await axios.patch(`${BASE_URL}/user/toggleAccess`, { userId, isDisabled: !isDisabled });
      console.log("User access toggled successfully", response.data);
      getUsers();
    } catch (error) {
      console.log("Error toggling user access", error);
    }
  };

  // Toggle admin access
  const toggleAdminAccess = async (adminId, isDisabled) => {
    try {
      const response = await axios.patch(`${BASE_URL}/admin/toggleAccess`, { adminId, isDisabled: !isDisabled });
      console.log("Admin access toggled successfully", response.data);
      getAdmins();
    } catch (error) {
      console.log("Error toggling admin access", error);
    }
  };

  // Sort tasks by date
  const sortTasksByDate = (tasks) => {
    if (!tasks || tasks.length === 0) return [];

    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Show Task Data 
  const getTask = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/task/getTask`)
      const tasks = response.data.taskData;
      setTaskData(tasks);
      // Count tasks by status after fetching all tasks
      countTasksByStatus(tasks);
      console.log(taskData);
    } catch (error) {
      console.log("-----Task Data-----", error);
    }
  }


  const getDisabledTask = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/task/getDisabledTasks`)
      setDisabledTaskData(response.data.taskData)
    } catch (error) {
      console.log("-----Task Data-----", error);
    }
  }

  // Function to handle card click
  const handleCardClick = (cardType) => {
    setSelectedCard(cardType === selectedCard ? null : cardType);

    if (cardType === 'tasks') {
      getTask();
      fetchUsersWithTasks();
    } else if (cardType === 'admins') {
      getAdmins();
    } else if (cardType === 'users') {
      getUsers();
    } else if (cardType === 'pendingTasks') {
      getTask();
    } else if (cardType === 'completedTasks') {
      getTask();
    } else if (cardType === 'disabledTasks') {
      getDisabledTask();
    }
  };

  // Card colors
  const cardColors = {
    admins: { bg: "bg-blue-100", hover: "hover:bg-blue-200", border: "border-blue-300", text: "text-blue-800", icon: "text-blue-500" },
    users: { bg: "bg-green-100", hover: "hover:bg-green-200", border: "border-green-300", text: "text-green-800", icon: "text-green-500" },
    tasks: { bg: "bg-purple-100", hover: "hover:bg-purple-200", border: "border-purple-300", text: "text-purple-800", icon: "text-purple-500" },
    pendingTasks: { bg: "bg-yellow-100", hover: "hover:bg-yellow-200", border: "border-yellow-300", text: "text-yellow-800", icon: "text-yellow-500" },
    completedTasks: { bg: "bg-green-100", hover: "hover:bg-green-200", border: "border-green-300", text: "text-green-800", icon: "text-green-500" }
  };

  // Icons for each card
  const renderIcon = (type) => {
    switch (type) {
      case 'admins':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cardColors[type].icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a1 1 0 10-2 0c0 .535.087 1.061.25 1.566C4.523 13.327 6.614 15 10 15s5.477-1.673 6.75-3.434A6.01 6.01 0 0017 10a1 1 0 10-2 0 4 4 0 01-.783 2.392A5.002 5.002 0 0010 11z" clipRule="evenodd" />
          </svg>
        );
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cardColors[type].icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case 'tasks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cardColors[type].icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        );
      case 'pendingTasks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cardColors[type].icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'completedTasks':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${cardColors[type].icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderDetails = () => {
    if (!selectedCard) return null;

    if (selectedCard === 'admins') {
      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Admin Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminData.map(admin => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{admin.firstname} {admin.lastname || ''}</td>
                    <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id={`toggle-admin-${admin._id}`}
                          checked={!admin.isDisabled}
                          onChange={() => toggleAdminAccess(admin._id, admin.isDisabled)}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`toggle-admin-${admin._id}`}
                          className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-green-500"
                        >
                          <span className="absolute transform transition-transform duration-300 ease-in-out h-6 w-6 rounded-full bg-white shadow-md left-0 peer-checked:translate-x-4"></span>
                        </label>
                      </div>
                      <span className={`text-xs ml-2 ${admin.isDisabled ? 'text-red-500' : 'text-green-500'}`}>
                        {admin.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedCard === 'users') {
      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">User Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Access</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userData.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{user.firstname + " " + (user.lastname || '')}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id={`toggle-${user._id}`}
                          checked={!user.isDisabled}
                          onChange={() => toggleUserAccess(user._id, user.isDisabled)}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`toggle-${user._id}`}
                          className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-green-500"
                        >
                          <span className="absolute transform transition-transform duration-300 ease-in-out h-6 w-6 rounded-full bg-white shadow-md left-0 peer-checked:translate-x-4"></span>
                        </label>
                      </div>
                      <span className={`text-xs ml-2 ${user.isDisabled ? 'text-red-500' : 'text-green-500'}`}>
                        {user.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openCreateTaskModal(user._id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                        disabled={user.isDisabled}
                      >
                        <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Assign Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedCard === 'tasks') {
      // If a filtered user is selected, show their tasks
      if (selectedFilteredUser) {
        return (
          <div className="mt-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Tasks for {selectedFilteredUser.firstname} {selectedFilteredUser.lastname}
              </h3>
              <div className="flex items-center">
                <button
                  onClick={toggleSortDirection}
                  className="flex items-center px-3 py-1.5 mr-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <span className="mr-1">Sort by Date</span>
                  {sortDirection === 'asc' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={clearSelectedUser}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to all tasks
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Content</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userTasks.map(task => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3 px-4 text-gray-800">{task.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {task.content}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {task.userId && task.userId._id === selectedFilteredUser._id
                          ? 'Created by this user'
                          : 'Assigned to this user'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700">Edit</button>
                        <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userTasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No tasks found for this user.
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Task Details</h3>
          <div className="flex justify-between items-center mb-2">
            <div></div>
            <button
              onClick={toggleSortDirection}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <span className="mr-1">Sort by Date</span>
              {sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Content</th>
                  <th className="py-3 px-4 text-left">Assigned by</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortTasksByDate(taskData).map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {task.content}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.userId ? `${task.userId.firstname} ${task.userId.lastname || ''}` : 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Users With Tasks Section */}
          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Users With Tasks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user._id}
                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleUserClick(user._id)}>
                    <td className="py-3 px-4 text-gray-800">{user.firstname + " " + (user.lastname || '')}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.role === 'admin' ? 'Administrator' : 'Regular User'}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id={`toggle-${user._id}`}
                          checked={!user.isDisabled}
                          onChange={() => toggleUserAccess(user._id, user.isDisabled)}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`toggle-${user._id}`}
                          className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-green-500"
                        >
                          <span className="absolute transform transition-transform duration-300 ease-in-out h-6 w-6 rounded-full bg-white shadow-md left-0 peer-checked:translate-x-4"></span>
                        </label>
                      </div>
                      <span className={`text-xs ml-2 ${user.isDisabled ? 'text-red-500' : 'text-green-500'}`}>
                        {user.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedCard === 'pendingTasks') {
      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Pending Tasks</h3>
          <div className="flex justify-between items-center mb-2">
            <div></div>
            <button
              onClick={toggleSortDirection}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <span className="mr-1">Sort by Date</span>
              {sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Content</th>
                  <th className="py-3 px-4 text-left">Assigned by</th>
                  <th className="py-3 px-4 text-left">Assigned to</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingTaskData.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {task.content}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.userId && `${task.userId.firstname} ${task.userId.lastname}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.assignedTo && `${task.assignedTo.firstname} ${task.assignedTo.lastname}`}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedCard === 'completedTasks') {
      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Completed Tasks</h3>
          <div className="flex justify-between items-center mb-2">
            <div></div>
            <button
              onClick={toggleSortDirection}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <span className="mr-1">Sort by Date</span>
              {sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Content</th>
                  <th className="py-3 px-4 text-left">Assigned by</th>
                  <th className="py-3 px-4 text-left">Assigned to</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortTasksByDate(completedTaskData).map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {task.content}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.userId && `${task.userId.firstname} ${task.userId.lastname}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.assignedTo && `${task.assignedTo.firstname} ${task.assignedTo.lastname}`}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (selectedCard === 'disabledTasks') {
      return (
        <div className="mt-8 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Inactive Task Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Content</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Assigned To</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {disabledTaskData.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 text-gray-800">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {task.content}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{task.category}</td>
                    <td className="py-3 px-4 text-gray-600">{task.userId ? `${task.userId.firstname} ${task.userId.lastname}` : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleTaskStatus(task._id, task.isDisabled)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Activate Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {disabledTaskData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inactive tasks found.
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Handle task form change
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value
    });
  };

  // Open modal for creating a new task
  const openCreateTaskModal = (userId = '') => {
    setModalType('create');
    setTaskForm({
      title: '',
      content: '',
      category: '',
      status: 'pending'  // Changed from 'Pending' to 'pending' to match enum
    });
    setSelectedUser(userId);
    setShowTaskModal(true);
  };

  // Open modal for editing an existing task
  const openEditTaskModal = (task) => {
    setModalType('edit');
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      content: task.content,
      category: task.category || '',
      status: task.status
    });
    setSelectedUser(task.userId._id);
    setShowTaskModal(true);
  };

  // Create a new task
  const createTask = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No authentication token found in localStorage");
        alert("You need to be logged in to create tasks");
        return;
      }

      const taskData = {
        ...taskForm,
        assignedTo: selectedUser
      };

      console.log("Creating task with token:", token);
      console.log("Task data:", taskData);

      // Include auth token in headers with the correct Bearer format
      const response = await axios.post(`${BASE_URL}/task/addTask`, taskData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Task created successfully:", response.data);
      setShowTaskModal(false);
      fetchTaskCount();
      getTask();
      alert("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
      }
      alert(`Failed to create task: ${error.response?.data?.message || error.message}`);
    }
  };

  // Update an existing task
  const updateTask = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      const taskData = {
        ...taskForm,
        userId: selectedUser
      };

      // Include auth token in headers
      await axios.patch(`${BASE_URL}/task/updateTasks/${selectedTask._id}`, taskData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setShowTaskModal(false);
      fetchTaskCount();
      getTask();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem('token');

        await axios.delete(`${BASE_URL}/task/deleteTask/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        fetchTaskCount();
        fetchDisableTaskCount();
        getTask();
        getDisabledTask();

      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  }

  const toggleTaskStatus = async (taskId, isDisabled) => {
    try {
      const token = localStorage.getItem('token');

      await axios.patch(`${BASE_URL}/task/toggleDisabled/${taskId}`,
        {},  // No need to send the status in the body as the backend will toggle it
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh task counts and lists
      fetchTaskCount();
      fetchDisableTaskCount();
      getTask();
      getDisabledTask();

      // Show success message
      alert(isDisabled ? "Task activated successfully!" : "Task deactivated successfully!");
    } catch (error) {
      console.error("Error toggling task status:", error);
      alert("Failed to change task status. Please try again.");
    }
  };

  // Handle form submission
  const handleTaskFormSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      createTask();
    } else {
      updateTask();
    }
  };

  const renderTaskModal = () => {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${showTaskModal ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg z-10 w-11/12 md:w-1/3">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">{modalType === 'create' ? 'Create Task' : 'Edit Task'}</h2>
            <form onSubmit={handleTaskFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskFormChange}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={taskForm.content}
                  onChange={handleTaskFormChange}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={taskForm.status}
                  onChange={handleTaskFormChange}
                  className="block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userId">Assign to</label>
                <select
                  id="userId"
                  name="userId"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select a user</option>
                  {userOptions.map(user => (
                    <option key={user._id} value={user._id}>{user.firstname} {user.lastname}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="mr-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {modalType === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 ">
      <div className="w-full max-w-full h-full flex flex-col md:flex-row bg-white  shadow-xl overflow-hidden" style={{ minHeight: '90vh' }}>
        <div className="hidden md:flex md:w-1/4 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 md:p-12 flex-col justify-center items-center text-white relative">
          <div className="absolute inset-0 bg-black opacity-10 z-0"></div>
          <div className="relative z-10 text-center">
            <svg className="w-24 h-24 mx-auto text-indigo-200 opacity-80 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-base text-indigo-100">
              Overview of your Task Manager.
            </p>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col p-6 sm:p-8 overflow-y-auto">
          <div className="text-center mb-8 md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h1>
            <p className="text-gray-600 text-md">Here's your task management overview.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div
              className={`${cardColors.admins.bg} ${cardColors.admins.hover} ${cardColors.admins.border} border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'admins' ? 'ring-4 ring-blue-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('admins'); getAdmins() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${cardColors.admins.text}`}>Admins</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{adminCount}</p>
                </div>
                {renderIcon('admins')}
              </div>
            </div>

            <div
              className={`${cardColors.users.bg} ${cardColors.users.hover} ${cardColors.users.border} border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'users' ? 'ring-4 ring-green-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('users'); getUsers() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${cardColors.users.text}`}>Users</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{userCount}</p>
                </div>
                {renderIcon('users')}
              </div>
            </div>

            <div
              className={`${cardColors.tasks.bg} ${cardColors.tasks.hover} ${cardColors.tasks.border} border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'tasks' ? 'ring-4 ring-purple-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('tasks'); getTask() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${cardColors.tasks.text}`}>Tasks</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{taskCount}</p>
                </div>
                {renderIcon('tasks')}
              </div>
            </div>
          </div>

          {/* New row for task status cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div
              className={`${cardColors.pendingTasks.bg} ${cardColors.pendingTasks.hover} ${cardColors.pendingTasks.border} border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'pendingTasks' ? 'ring-4 ring-yellow-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('pendingTasks'); getTask() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${cardColors.pendingTasks.text}`}>Pending Tasks</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{pendingTaskCount}</p>
                </div>
                {renderIcon('pendingTasks')}
              </div>
            </div>

            <div
              className={`${cardColors.completedTasks.bg} ${cardColors.completedTasks.hover} ${cardColors.completedTasks.border} border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'completedTasks' ? 'ring-4 ring-green-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('completedTasks'); getTask() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${cardColors.completedTasks.text}`}>Completed Tasks</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{completedTaskCount}</p>
                </div>
                {renderIcon('completedTasks')}
              </div>
            </div>

            <div
              className={`bg-red-100 hover:bg-red-200 border-red-300 border rounded-lg shadow-md p-5 cursor-pointer transform transition-all duration-300 hover:scale-105 ${selectedCard === 'disabledTasks' ? 'ring-4 ring-red-300 scale-105' : ''}`}
              onClick={() => { handleCardClick('disabledTasks'); getDisabledTask() }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold text-red-800`}>Inactive Task</h2>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{disabledTaskCount}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {selectedCard === 'tasks' && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={openCreateTaskModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Task
              </button>
            </div>
          )}

          <div className="flex-grow">
            {renderDetails()}
          </div>
        </div>
      </div>

      {renderTaskModal()}

      <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-in-out;
      }
    `}</style>
    </div>
  );
};

export default Dashboard;