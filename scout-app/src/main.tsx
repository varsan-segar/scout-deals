import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthGuard } from 'lemma-sdk/react'
import { lemmaClient } from './lemma-client'
import { App } from './App'
import { ThemeProvider } from './components/ThemeProvider'
import './styles/globals.css'

const queryClient = new QueryClient()

async function bootstrap() {
  await lemmaClient.initialize()

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" storageKey="scout-ui-theme" enableSystem>
          <AuthGuard
            client={lemmaClient}
            loadingFallback={
              <div className="flex items-center justify-center h-screen w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <App />
          </AuthGuard>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

bootstrap()
