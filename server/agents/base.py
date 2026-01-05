from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime


class ActivityLogEntry:
    """Structured activity log entry with timestamp and context."""
    def __init__(self, action: str, agent_name: str, agent_role: str, client: str = None):
        self.timestamp = datetime.now()
        self.action = action
        self.agent_name = agent_name
        self.agent_role = agent_role
        self.client = client
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp.isoformat(),
            "time_display": self.timestamp.strftime("%H:%M:%S"),
            "date_display": self.timestamp.strftime("%Y-%m-%d"),
            "action": self.action,
            "agent": self.agent_name,
            "role": self.agent_role,
            "client": self.client
        }
    
    def __str__(self) -> str:
        client_str = f" [{self.client}]" if self.client else ""
        return f"[{self.timestamp.strftime('%H:%M:%S')}] [{self.agent_role}]{client_str} {self.action}"


class Agent(ABC):
    """
    Abstract Base Class for all Autonomous Agents.
    Enhanced with structured logging and client tracking.
    """
    def __init__(self, name: str, role: str, tools: List[Any] = None):
        self.name = name
        self.role = role
        self.tools = tools or []
        self.activity_log: List[ActivityLogEntry] = []
        self.current_client: str = None  # Track which client/document is being processed

    def set_current_client(self, client_name: str):
        """Set the current client/document being processed."""
        self.current_client = client_name

    def log_activity(self, action: str, client: str = None):
        """Logs an action with timestamp and client context."""
        client_name = client or self.current_client
        entry = ActivityLogEntry(action, self.name, self.role, client_name)
        print(f"[{self.name.upper()}] {entry}")
        self.activity_log.append(entry)

    def get_activity_log(self, limit: int = None) -> List[Dict[str, Any]]:
        """Get activity log as list of dictionaries for API response."""
        logs = self.activity_log[-limit:] if limit else self.activity_log
        return [entry.to_dict() for entry in logs]

    def get_activity_log_strings(self, limit: int = None) -> List[str]:
        """Get activity log as formatted strings for backward compatibility."""
        logs = self.activity_log[-limit:] if limit else self.activity_log
        return [str(entry) for entry in logs]

    def use_tool(self, tool_name: str, **kwargs):
        """
        Executes a registered tool by name.
        """
        self.log_activity(f"Using Tool: {tool_name}")
        for tool in self.tools:
            if tool.__class__.__name__ == tool_name:
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
