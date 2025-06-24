import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">UWO Final Grade</h1>
        <p className="text-lg mt-2">Your friendly grade calculator</p>
      </header>
      <main className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Grades</h2>
          {/* Grade table will go here */}
          <p>Grade information will be displayed here.</p>
        </div>
      </main>
    </div>
  )
}

export default App
