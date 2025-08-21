"use client"

import * as React from "react"
import { Search, FileText, MessageSquare, FolderOpen, Ticket, BookOpen, Notebook, File as Form } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: string
  moduleId: string
  title: string
  content: string
  url: string
  metadata?: any
  score?: number
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const moduleIcons = {
  projects: FolderOpen,
  care: Ticket,
  wiki: BookOpen,
  chat: MessageSquare,
  forms: Form,
  notes: Notebook
}

const moduleColors = {
  projects: "bg-blue-100 text-blue-800",
  care: "bg-green-100 text-green-800",
  wiki: "bg-purple-100 text-purple-800",
  chat: "bg-orange-100 text-orange-800",
  forms: "bg-pink-100 text-pink-800",
  notes: "bg-yellow-100 text-yellow-800"
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case "ArrowUp":
          event.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
          event.preventDefault()
          if (results[selectedIndex]) {
            window.open(results[selectedIndex].url, "_blank")
            onOpenChange(false)
          }
          break
        case "Escape":
          onOpenChange(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // Try to fetch from API first
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        
        // Transform API response to flat results array
        const flatResults: SearchResult[] = []
        
        if (data.results?.projects) {
          flatResults.push(...data.results.projects.map((project: any) => ({
            id: project.id,
            moduleId: project.moduleId || 'projects',
            title: project.title,
            content: project.description || '',
            url: project.url,
            metadata: project.metadata,
            type: project.type
          })))
        }
        
        if (data.results?.notes) {
          flatResults.push(...data.results.notes.map((note: any) => ({
            id: note.id,
            moduleId: note.moduleId || 'notes',
            title: note.title,
            content: note.description || '',
            url: note.url,
            metadata: note.metadata,
            type: note.type
          })))
        }
        
        if (data.results?.documents) {
          flatResults.push(...data.results.documents.map((doc: any) => ({
            id: doc.id,
            moduleId: doc.moduleId,
            title: doc.title,
            content: doc.description || '',
            url: doc.url,
            metadata: doc.metadata,
            type: doc.type
          })))
        }
        
        setResults(flatResults)
      } else {
        // Fallback to local results if API fails
        const localResults = [
          { 
            id: '1', 
            moduleId: 'projects', 
            title: 'My First Project', 
            content: 'Created via API test - Sample project for demonstration',
            url: '/projects/1',
            score: 0.9
          },
          { 
            id: '2', 
            moduleId: 'notes', 
            title: 'Meeting Notes', 
            content: 'Initial meeting notes for the project setup and planning',
            url: '/notes/1',
            score: 0.8
          },
          { 
            id: '3', 
            moduleId: 'wiki', 
            title: 'Getting Started Guide', 
            content: 'Learn how to use the Oxlas AI-powered workspace effectively',
            url: '/wiki/getting-started',
            score: 0.7
          },
          { 
            id: '4', 
            moduleId: 'chat', 
            title: 'Team Discussion', 
            content: 'Discussion about project requirements and timeline',
            url: '/chat/team-discussion',
            score: 0.6
          },
          { 
            id: '5', 
            moduleId: 'forms', 
            title: 'Project Feedback Form', 
            content: 'Collect feedback from team members about project progress',
            url: '/forms/feedback',
            score: 0.5
          },
        ].filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setResults(localResults)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fallback to local results on error
      const localResults = [
        { 
          id: '1', 
          moduleId: 'projects', 
          title: 'My First Project', 
          content: 'Created via API test - Sample project for demonstration',
          url: '/projects/1',
          score: 0.9
        },
        { 
          id: '2', 
          moduleId: 'notes', 
          title: 'Meeting Notes', 
          content: 'Initial meeting notes for the project setup and planning',
          url: '/notes/1',
          score: 0.8
        },
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(localResults)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    window.open(result.url, "_blank")
    onOpenChange(false)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </span>
      ) : part
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search across all modules..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Press ↑↓ to navigate, Enter to open, Esc to close</span>
            {results.length > 0 && (
              <span>{results.length} results found</span>
            )}
          </div>

          <div 
            ref={resultsRef}
            className="space-y-2 max-h-[60vh] overflow-y-auto"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-2">Try searching with different keywords</p>
              </div>
            )}

            {!query && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Quick Access</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(moduleIcons).map(([moduleId, Icon]) => (
                    <Button
                      key={moduleId}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => {
                        window.open(`/${moduleId}`, "_blank")
                        onOpenChange(false)
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium capitalize">{moduleId}</div>
                        <div className="text-xs text-muted-foreground">
                          {moduleId === "projects" && "Project Management"}
                          {moduleId === "care" && "Customer Support"}
                          {moduleId === "wiki" && "Documentation"}
                          {moduleId === "chat" && "Team Chat"}
                          {moduleId === "forms" && "Forms & Surveys"}
                          {moduleId === "notes" && "Note Taking"}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {results.map((result, index) => {
              const Icon = moduleIcons[result.moduleId as keyof typeof moduleIcons] || FileText
              const colorClass = moduleColors[result.moduleId as keyof typeof moduleColors] || "bg-gray-100 text-gray-800"
              
              return (
                <div
                  key={result.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    index === selectedIndex ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium truncate">
                          {highlightMatch(result.title, query)}
                        </h4>
                        <Badge variant="secondary" className={`text-xs ${colorClass}`}>
                          {result.moduleId}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {highlightMatch(truncateText(result.content, 150), query)}
                      </p>
                      {result.score && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Relevance: {Math.round(result.score * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}