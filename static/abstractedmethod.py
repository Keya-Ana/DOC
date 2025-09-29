from abc import ABC, abstractmethod

# Abstract base class
class Shape(ABC):
    def __init__(self, c:str):
        self.color = c

    def get_color(self):
        return self.color

    @abstractmethod
    def get_area(self) -> float:
        pass

# Concrete subclass
class Square(Shape):
    def __init__(self, c, side):
        super().__init__(c)
        self.side = side

    def get_area(self) -> float:
        return self.side * self.side

# Example usage (driver code)
s = Square("red", 5.0)
print(s.get_color())     # Output: red
print(s.get_area())      # Output: 25.0