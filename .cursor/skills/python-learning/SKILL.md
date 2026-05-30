---
name: python-learning
description: Generates Python code with pedagogical explanations comparing syntax to TypeScript. Use when writing Python scripts, learning Python patterns, or comparing Python to TypeScript/JavaScript.
---

# Python — Génération pédagogique (comparaison TypeScript)

## Équivalences TypeScript -> Python

| TypeScript | Python |
|---|---|
| const x: string = 'hi' | x: str = 'hi' (type hints optionnels) |
| () => value | lambda: value ou def |
| arr.map(fn) | [fn(x) for x in arr] |
| arr.filter(fn) | [x for x in arr if fn(x)] |
| try/catch | try/except |
| console.log | print() |
| import x from 'module' | from module import x |
| npm install | pip install ou uv add |
| interface / type | TypedDict, dataclass, ou Pydantic |

## Fonctions Python

```python
# Equivalent TypeScript : const add = (a: number, b: number): number => a + b
def add(a: int, b: int) -> int:
    return a + b

# Valeur par défaut — comme en TS
def greet(name: str, greeting: str = "Bonjour") -> str:
    return f"{greeting}, {name}!"

# Lambda (arrow function simple)
double = lambda x: x * 2
```

## Types avec Pydantic (équivalent Zod)

```python
from pydantic import BaseModel, EmailStr

class CreateUserDTO(BaseModel):
    name: str
    email: EmailStr
    age: int

# Utilisation — validation automatique
user = CreateUserDTO(name="Alice", email="alice@test.com", age=25)
print(user.model_dump())  # -> dict Python
```

## Async Python (même concept qu'en TypeScript)

```python
import asyncio
import aiohttp

async def fetch_user(id: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"https://api.example.com/users/{id}") as response:
            return await response.json()

async def main() -> None:
    user = await fetch_user("123")
    print(user)

asyncio.run(main())
```
