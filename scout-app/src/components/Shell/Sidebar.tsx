import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { List, Settings, Plus, Boxes, BarChart3, Columns3, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { ThemeToggle } from '../ThemeToggle'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-64'} h-full bg-card border-r flex flex-col p-6 shrink-0 transition-all duration-300 relative`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background text-muted-foreground hover:text-foreground z-10 shadow-sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} pb-8`}>
        <Boxes className="text-primary shrink-0" size={24} />
        {!isCollapsed && <span className="text-lg font-bold tracking-tight">Scout</span>}
      </div>

      <div className="mb-4">
        <Button className={`w-full ${isCollapsed ? 'px-0 justify-center' : 'justify-center'}`} onClick={() => navigate('/deal/new')} title={isCollapsed ? "New Deal" : undefined}>
          <Plus size={16} className={isCollapsed ? '' : 'mr-2'} /> 
          {!isCollapsed && "New Deal"}
        </Button>
      </div>

      <div className="h-px bg-border my-2" />

      <div className="flex flex-col gap-1">
        <Link 
          to="/dashboard" 
          title={isCollapsed ? "Dashboard" : undefined}
          className={`flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          } ${
            isActive('/dashboard') ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
          }`}
        >
          <BarChart3 size={18} className="shrink-0" /> {!isCollapsed && "Dashboard"}
        </Link>
        <Link 
          to="/pipeline" 
          title={isCollapsed ? "Deal Board" : undefined}
          className={`flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          } ${
            isActive('/pipeline') ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
          }`}
        >
          <Columns3 size={18} className="shrink-0" /> {!isCollapsed && "Deal Board"}
        </Link>
        <Link 
          to="/deals" 
          title={isCollapsed ? "All Deals" : undefined}
          className={`flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          } ${
            isActive('/deals') ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
          }`}
        >
          <List size={18} className="shrink-0" /> {!isCollapsed && "All Deals"}
        </Link>
      </div>

      <div className="h-px bg-border my-2" />

      <div className="flex flex-col gap-1">
        <Link 
          to="/thesis" 
          title={isCollapsed ? "Thesis Config" : undefined}
          className={`flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          } ${
            isActive('/thesis') ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
          }`}
        >
          <Settings size={18} className="shrink-0" /> {!isCollapsed && "Thesis Config"}
        </Link>
        <Link 
          to="/docs" 
          title={isCollapsed ? "Guide" : undefined}
          className={`flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          } ${
            isActive('/docs') ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
          }`}
        >
          <BookOpen size={18} className="shrink-0" /> {!isCollapsed && "Guide"}
        </Link>
      </div>

      <div className={`mt-auto pt-4 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} text-sm text-muted-foreground`}>
        {!isCollapsed && <span>Theme</span>}
        <ThemeToggle />
      </div>
    </nav>
  )
}
