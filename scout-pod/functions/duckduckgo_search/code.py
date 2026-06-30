#python_packages: ddgs
#input_type_name: DDGSearchInput
#output_type_name: DDGSearchResult
#function_name: duckduckgo_search

from pydantic import BaseModel
from typing import List
from lemma_sdk import FunctionContext

class DDGSearchInput(BaseModel):
    query: str

class SearchResult(BaseModel):
    title: str
    link: str
    snippet: str

class DDGSearchResult(BaseModel):
    results: List[SearchResult]

def duckduckgo_search(ctx: FunctionContext, input: DDGSearchInput) -> DDGSearchResult:
    try:
        from ddgs import DDGS
        ddgs = DDGS()
        # Fetch up to 10 results
        search_results = ddgs.text(input.query, max_results=10)
        
        results = []
        if search_results:
            for item in search_results:
                results.append(SearchResult(
                    title=item.get('title', ''),
                    link=item.get('href', ''),
                    snippet=item.get('body', '')
                ))
        return DDGSearchResult(results=results)
    except Exception as e:
        # Gracefully handle failures like timeouts or rate limits
        print(f"DuckDuckGo search failed: {e}")
        return DDGSearchResult(results=[])
