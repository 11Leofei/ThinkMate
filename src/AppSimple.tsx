import { useState } from 'react'

export default function AppSimple() {
  const [currentThought, setCurrentThought] = useState('')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">ThinkMate - 你的AI思维伙伴</h1>
        <textarea
          value={currentThought}
          onChange={(e) => setCurrentThought(e.target.value)}
          placeholder="输入你的想法..."
          className="w-full p-3 bg-card border border-border rounded-lg text-foreground"
          rows={4}
        />
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          onClick={() => alert('ThinkMate 正在工作！')}
        >
          保存想法
        </button>
      </div>
    </div>
  )
}