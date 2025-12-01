from abc import ABC, abstractmethod

class FlowStrategy(ABC):
    @abstractmethod
    def execute(self, payload: dict):
        pass
