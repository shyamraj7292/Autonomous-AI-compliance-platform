import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class RAGService:
    """
    Production RAG Service using ChromaDB for vector storage.
    Falls back to in-memory list if ChromaDB is not available.
    """
    def __init__(self):
        self.knowledge_base: List[Dict] = []  # Fallback
        self.collection = None
        self.embedding_model = None
        
        # Initialize Gemini for embeddings
        api_key = os.getenv("GEMINI_API_KEY")
        if GEMINI_AVAILABLE and api_key and api_key != "your_gemini_api_key_here":
            genai.configure(api_key=api_key)
            self.embedding_model = "models/text-embedding-004"
            print("[RAG] Gemini embeddings initialized")
        
        # Initialize ChromaDB
        if CHROMA_AVAILABLE:
            try:
                self.client = chromadb.PersistentClient(path="./chroma_db")
                self.collection = self.client.get_or_create_collection(
                    name="compliance_knowledge",
                    metadata={"hnsw:space": "cosine"}
                )
                print(f"[RAG] ChromaDB initialized with {self.collection.count()} documents")
            except Exception as e:
                print(f"[RAG] ChromaDB Error: {e}. Using in-memory fallback.")
        else:
            print("[RAG] ChromaDB not installed. Using in-memory fallback.")

    def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding using Gemini or return None for default."""
        if self.embedding_model:
            try:
                result = genai.embed_content(
                    model=self.embedding_model,
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except Exception as e:
                print(f"[RAG] Embedding error: {e}")
                return None
        return None

    async def add_document(self, content: str, metadata: Dict[str, Any]):
        """
        Add a document to the knowledge base.
        """
        doc_id = f"doc_{len(self.knowledge_base)}"
        
        if self.collection:
            embedding = self._get_embedding(content)
            if embedding:
                self.collection.add(
                    ids=[doc_id],
                    embeddings=[embedding],
                    documents=[content],
                    metadatas=[metadata]
                )
            else:
                # Use ChromaDB's default embedding if Gemini not available
                self.collection.add(
                    ids=[doc_id],
                    documents=[content],
                    metadatas=[metadata]
                )
            print(f"[RAG] Indexed document: {metadata.get('title', doc_id)}")
        else:
            # Fallback to in-memory
            self.knowledge_base.append({
                "id": doc_id,
                "content": content, 
                "meta": metadata
            })
            print(f"[RAG] In-memory indexed: {metadata.get('title', doc_id)}")

    async def query(self, query_text: str, top_k: int = 3) -> List[Dict]:
        """
        Query the knowledge base for relevant documents.
        """
        if self.collection and self.collection.count() > 0:
            embedding = self._get_embedding(query_text)
            if embedding:
                results = self.collection.query(
                    query_embeddings=[embedding],
                    n_results=min(top_k, self.collection.count())
                )
            else:
                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=min(top_k, self.collection.count())
                )
            
            # Format results
            docs = []
            for i, doc in enumerate(results.get('documents', [[]])[0]):
                docs.append({
                    "content": doc,
                    "metadata": results.get('metadatas', [[]])[0][i] if results.get('metadatas') else {}
                })
            print(f"[RAG] Found {len(docs)} relevant documents")
            return docs
        else:
            # Fallback to in-memory
            print(f"[RAG] Searching in-memory ({len(self.knowledge_base)} docs)")
            return self.knowledge_base[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base."""
        if self.collection:
            return {
                "type": "ChromaDB",
                "document_count": self.collection.count(),
                "embedding_model": self.embedding_model or "default"
            }
        else:
            return {
                "type": "In-Memory",
                "document_count": len(self.knowledge_base),
                "embedding_model": None
            }
