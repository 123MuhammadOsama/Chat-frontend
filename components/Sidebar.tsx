import { useState } from 'react';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('Student');

  return (
    <div className="fixed left-0 w-full md:w-1/4 bg-gray-100 h-screen p-4 overflow-y-auto">
      <div className="flex space-x-4 pt-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'Student' ? 'bg-white shadow-md' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('Student')}
        >
          Student
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'Writer' ? 'bg-white shadow-md' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('Writer')}
        >
          Writer
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="mt-4">
        {activeTab === 'Student' && (
          <div className="p-4 bg-white rounded-lg shadow-md">
            <img
              src="https://cdn.esquimaltmfrc.com/wp-content/uploads/2015/09/flat-faces-icons-circle-man-9.png"
              alt="student"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="flex flex-col mt-2">
              <span className="text-sm text-black">7006 - Accounting</span>
              <p className="text-gray-500 text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry...
              </p>


              <span className="text-sm text-black mt-96">7006 - Accounting</span>
              <p className="text-gray-500 text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry...
              </p><span className="text-sm text-black mt-96">7006 - Accounting</span>
              <p className="text-gray-500 text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry...
              </p>


            </div>
          </div>
        )}
        {activeTab === 'Writer' && (
          <div className="p-4 bg-white rounded-lg shadow-md">
            <img
              src="https://cdn.esquimaltmfrc.com/wp-content/uploads/2015/09/flat-faces-icons-circle-man-9.png"
              alt="writer"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="flex flex-col mt-2">
              <span className="text-sm text-black">Writer's Dashboard</span>
              <p className="text-gray-500 text-sm">
                Manage your writing assignments and progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
