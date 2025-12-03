from abc import ABC, abstractmethod

class FlowStrategy(ABC):
    @abstractmethod
    async def execute(self, payload: dict):
        pass