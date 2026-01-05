from abc import ABC, abstractmethod
from typing import Dict, Any, List

class Agent(ABC):
    """
    Abstract Base Class for all Autonomous Agents.
    """
    def __init__(self, name: str, role: str, tools: List[Any] = None):
        self.name = name
        self.role = role
        self.tools = tools or []
        self.activity_log: List[str] = []

    def log_activity(self, action: str):
        """Logs an action to the agent's internal memory."""
        print(f"[{self.name.upper()}] {action}")
        self.activity_log.append(f"[{self.role}] {action}")

    def use_tool(self, tool_name: str, **kwargs):
        """
        Executes a registered tool by name.
        """
        self.log_activity(f"Using Tool: {tool_name}")
        for tool in self.tools:
            # Simple class name matching
            if tool.__class__.__name__ == tool_name:
                # Find a callable method in the tool
                # Simplified: assumes one main public method or specific naming convention
                # For this demo, we can just return the tool instance to be called directly
                return tool
        return None

    @abstractmethod
    async def think(self, context: Dict[str, Any]) -> str:
        """The 'Reasoning' step where the agent decides what to do."""
        pass

    @abstractmethod
    async def act(self, plan: str) -> Dict[str, Any]:
        """The 'Execution' step where the agent performs the task."""
        pass
