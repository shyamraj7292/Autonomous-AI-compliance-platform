from typing import List, Dict

class RAGService:
    """
    Service for the Knowledge Base. 
    In a full production env, this would connect to ChromaDB or Pinecone.
    """
    def __init__(self):
        self.knowledge_base = []

    async def add_document(self, content: str, metadata: Dict):
        """
        Simulates embedding and storing a document chunk.
        """
        print(f"[RAG] Indexing document: {metadata.get('title', 'Unknown')}")
        self.knowledge_base.append({"content": content, "meta": metadata})

    async def query(self, query_text: str, top_k: int = 3) -> List[Dict]:
        """
        Simulates retrieving relevant context from the knowledge base.
        """
        # In a real app, this would do cosine similarity search
        print(f"[RAG] Searching for: {query_text}")
        return self.knowledge_base[:top_k]
