import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-10">
          <h1 className="text-2xl font-serif">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-md text-center">{this.state.error?.message}</p>
          <button className="underline text-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}