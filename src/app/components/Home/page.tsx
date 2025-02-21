'use client'
import React, { useState } from 'react'


const HomePage = () => {
  const [inputText, setInputText] = useState('');

  // Function to handle input changes
  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setInputText(e.target.value);
  };

  // Function to handle send button click
  const handleSendClick = () => {
    setInputText(''); // Clears the input field
  };




  return (

    <div>
        <div className="flex justify-between items-center w-full px-4">
          <h1 className="text-slate-950 md:text-3xl sm:text-xl flex justify-center">Hands-Free AI</h1>
          <nav className="flex justify-end">
            <h1 className="rounded-full bg-black text-white w-10 h-10 flex items-center justify-center">
              T
            </h1>
          </nav>

          
      </div>

      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full flex justify-center items-center">
      <div className="relative w-[90%] md:w-[50%] max-w-[600px]">
        {/* Input Field */}
        <input 
          className="h-10 w-full rounded-full text-black bg-gray-200 p-2 pl-12 pr-12 shadow-lg outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Type something here..." 
          value={inputText}
          onChange={handleInputChange}
        />

        {/* Record Button */}
        <button 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Record"
        >
          🎙️
        </button>

        {/* Send Button */}
        <button 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Send"
          onClick={handleSendClick} // Clears input when clicked
        >
          ➤
        </button>
      </div>
    </nav>


    </div>
    


  )
}

export default HomePage
