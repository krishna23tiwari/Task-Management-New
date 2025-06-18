import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'
import axios from 'axios';


function App() {
  const [notes, setNotes] = useState([]);
  const [searchStr, setSearchStr] = useState('');
  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [assignedBy, setAssignedBy] = useState([])
  const [assignedTo, setAssignedTo] = useState([])


  const token = localStorage.getItem('token');

  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log("token form storage--------", token);
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      const getDb = await axios.get('http://localhost:5000/task/getTask', config);
      const taskData = getDb.data.taskData;

      setNotes(taskData)

    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }


  useEffect(() => {
    if (notes.length > 0 && currentUser) {
      const filterAssigedTo = notes.filter((note) => note.assignedTo && note.assignedTo.email === currentUser.email);
      const filterAssigedBy = notes.filter((note) => note.userId && note.userId.email === currentUser.email);
      setAssignedBy(filterAssigedBy);
      setAssignedTo(filterAssigedTo);
    }
  }, [notes, currentUser]);


  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user/getUsers');
      console.log("Received users data:", response.data.userData);
      setUsers(response.data.userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    const userData = getCurrentUser();
    console.log("Current user data:", userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  async function handleDelete(id) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      if (!id) {
        console.error("Cannot delete note: ID is undefined");
        return;
      }
      await axios.delete(`http://localhost:5000/task/deleteTask/${id}`, config);

      // Update the notes state to remove the deleted note
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.log("Error while deleting", error);
    }
  }

  // To update the data
  const [editingNote, setEditingNote] = useState(null);

  const updateNote = async (id, updatedNote) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      const response = await axios.patch(`http://localhost:5000/task/updateTasks/${id}`, updatedNote, config);
      console.log('Updated Note:', response.data);

      //  Show the new updated data
      fetchData()
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
  };

  const handleSaveClick = async () => {
    if (editingNote) {
      await updateNote(editingNote._id, editingNote);
      setEditingNote(null);
    }
  };

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeView, setActiveView] = useState('All');

  // State for new note
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: 'bg-emerald-200',
    assignedTo: ''
  });

  // State for image file
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // State for showing note form
  const [showNoteForm, setShowNoteForm] = useState(false);


  // Only keep All category
  const categories = [
    { name: 'All', count: notes?.length || 0, icon: '📋' }
  ];

  // Filter notes based on active view only
  let filteredNotes = notes;

  // Apply the view filter
  if (activeView === 'AssignedToMe') {
    filteredNotes = assignedTo;
  } else if (activeView === 'AssignedByMe') {
    filteredNotes = assignedBy;
  }

  // Function to get color for a note
  const getNoteColor = (note) => {
    if (note.color) return note.color;

    // Default colors based on status if color is missing
    if (note.status === 'completed') return 'bg-green-100';
    if (note.status === 'pending') return 'bg-yellow-100';

    // Fallback default color
    return 'bg-emerald-200';
  };

  // Searching
  const searchedData = filteredNotes.filter((note) =>
    searchStr !== "" ? note.title.toLowerCase().includes(searchStr.toLowerCase()) : filteredNotes
  );
  console.log("assignedTO-------------", assignedTo);
  // Handle adding new note
  const handleAddNote = async () => {
    if (newNote.title.trim() !== '' && newNote.content.trim() !== '' && newNote.assignedTo) {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }

        // Find the assigned user to get their email
        const assignedUser = users.find(user => user._id === newNote.assignedTo);

        // Create FormData object to handle file upload
        const formData = new FormData();

        // Add text fields to formData
        formData.append('title', newNote.title);
        formData.append('content', newNote.content);
        formData.append('color', newNote.color);
        formData.append('assignedTo', newNote.assignedTo);

        if (assignedUser?.email) {
          formData.append('assignedToEmail', assignedUser.email);
        }

        // Add image file if it exists
        if (imageFile) {
          formData.append('image', imageFile);
        }

        console.log('Sending task data with image');
        const response = await axios.post('http://localhost:5000/task/addTask', formData, config);
        console.log('Note added successfully:', response.data);

        // Reset image state
        setImageFile(null);
        setImagePreview(null);
      } catch (error) {
        console.error("Error while posting", error);
      }

      // Refresh the notes list
      fetchData();
      setNewNote({
        title: '',
        content: '',
        color: 'bg-emerald-200',
        assignedTo: ''
      });
      setShowNoteForm(false);
    } else {
      alert("Please fill all required fields including assigning to a user");
    }
  };

  // Simple function to toggle task status
  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

      await axios.patch(
        `http://localhost:5000/task/updateStatus/${id}`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* /* Sidebar */}
      <div className="w-64 p-6 bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">MindMark</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your thoughts organized</p>

        {/* Display current user info */}
        {currentUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Logged in as:</div>
            <div className="text-blue-600 font-normal text-sm py-1">{currentUser.email}</div>
            <button
              onClick={handleLogout}
              className="mt-2 text-xs capitalize text-red-600 hover:text-red-800"
            >
              Sign out
            </button>
          </div>
        )}

        <div className='flex items-center justify-center'>
          <button
            onClick={() => setShowNoteForm(true)}
            className="mt-6 w-12 h-12 rounded-full bg-black hover:animate-spin hover:bg-white hover:text-black hover:border-[1px] border-black text-white py-2 px-4 flex items-center justify-center transition-colors"
          >
            <span className="text-3xl mb-1.5 font-extralight ">+</span>
          </button>
        </div>

        <div className="mt-8">

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h2>
          <ul className="space-y-2">
            <li className="mt-4">
              <button
                onClick={() => {
                  setActiveView('AssignedToMe');
                  setActiveCategory('All');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${activeView === 'AssignedToMe'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
              >
                <span className="text-blue-500">📥</span>
                <span>Task Given to me</span>
                <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">
                  {assignedTo?.length || 0}
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveView('AssignedByMe');
                  setActiveCategory('All');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${activeView === 'AssignedByMe'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
              >
                <span className="text-green-500">📤</span>
                <span>Task Given By me</span>
                <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">
                  {assignedBy?.length || 0}
                </span>
              </button>
            </li>
            {categories.map(category => (
              <li key={category.name}>
                <button
                  onClick={() => {
                    setActiveCategory(category.name);
                    setActiveView('All');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${activeCategory === category.name && activeView === 'All'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">{category.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* /* Main Content  */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {
              {
                'AssignedToMe': 'Tasks Assigned To Me',
                'AssignedByMe': 'Tasks Assigned By Me',
                'All': 'All Notes'
              }[activeView] || activeCategory
            }
          </h2>

          <div className="flex space-x-4">
            <div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchStr}
                onChange={(e) => setSearchStr(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Note Form */}
        {showNoteForm && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full border-0 resize-none h-24 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Image Upload Section */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2 relative">
                  <img src={imagePreview} alt="Preview" className="h-24 rounded-lg object-contain bg-gray-50" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">

                {/* User dropdown menu */}
                <select
                  value={newNote.assignedTo}
                  onChange={(e) => setNewNote({ ...newNote, assignedTo: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Assign to user</option>
                  {users
                    .filter(user => !user.isDisabled)
                    .map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstname} {user.lastname}
                      </option>
                    ))
                  }
                </select>


              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.title || !newNote.content}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 lg:grid-cols-3 gap-6">
          {searchedData.map(note => (
            <div key={note._id} className="h-auto flex flex-col">
              <div className={`${getNoteColor(note)} bg-amber-200 rounded-t-xl p-5 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col h-auto min-h-[220px]`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg text-gray-800 truncate">{note.title}</h3>

                  {activeView !== 'All' && activeView !== 'AssignedToMe' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditClick(note)}
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { handleDelete(note._id); }}
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 mb-4">
                  <p className="text-gray-600 whitespace-pre-line">{note.content}</p>

                  {/* Display image if available */}
                  {note.image && (
                    <div className="mt-3">
                      <img
                        src={note.image}
                        alt={`Image for ${note.title}`}
                        className="rounded-lg w-full max-h-40 object-cover hover:object-contain cursor-pointer transition-all duration-200"
                        onClick={() => window.open(note.image, '_blank')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {activeView !== 'All' && activeView !== 'AssignedToMe' && (
                <div className={`flex flex-col ${getNoteColor(note)} bg-amber-200 rounded-b-xl p-4 shadow-sm hover:shadow-md transition-shadow gap-1 mt-[3px] text-xs text-gray-600 pt-2 py-2 h-[100px]`}>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned By:</span>
                    <span>{note.userId?.firstname} {note.userId?.lastname}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Assigned To:</span>
                    <span>{note.assignedTo?.firstname} {note.assignedTo?.lastname}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={note.status === 'completed'}
                        onChange={() => toggleTaskStatus(note._id, note.status)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2">
                        {note.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </label>
                  </div>
                </div>
              )}
              {
                activeView === 'AssignedToMe' && (
                  <div className={`flex flex-col ${getNoteColor(note)} bg-amber-200 rounded-b-xl p-4 shadow-sm hover:shadow-md transition-shadow gap-1 mt-[3px] text-xs text-gray-600 pt-2 py-2 h-[60px]`}>
                    <div className="flex items-center justify-between mt-2">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={note.status === 'completed'}
                          onChange={() => toggleTaskStatus(note._id, note.status)}
                          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">
                          {note.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </label>
                    </div>
                  </div>
                )
              }
            </div>
          ))}

        </div>

        {/* Edit Note Form */}
        {editingNote && (
          <div className="my-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full border-0 border-b border-gray-200 pb-2 text-xl font-medium placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Note content..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full border-0 resize-none h-24 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">

                {/* User dropdown menu for edit form */}
                <select
                  value={editingNote.assignedTo || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, assignedTo: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Assign to user</option>
                  {users
                    .filter(user => !user.isDisabled)
                    .map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstname} {user.lastname}
                      </option>
                    ))
                  }
                </select>


              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={!editingNote.title || !editingNote.content}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;