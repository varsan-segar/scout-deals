import { lemmaClient } from '../lemma-client'

export interface DealResearchInputs {
  deal_id: string
  file_path: string
  company_name: string
  sector: string
}

export async function startDealResearch(inputs: DealResearchInputs, timeoutMs = 15000) {
  const run = await lemmaClient.workflows.runs.create('deal-research')

  if (run.active_wait?.wait_type === 'HUMAN') {
    // Fire and forget the form submission so we don't block the UI timeout.
    // The browser will keep the request alive in the background and the server will process the inputs.
    lemmaClient.workflows.runs.submitForm(run.id, {
      node_id: run.active_wait.node_id,
      inputs,
    }).catch(err => {
      console.warn("Background form submission threw an error (timeout expected for long workflows):", err)
    })
    
    return run
  }

  return run
}
