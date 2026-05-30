---
name: rust-learning
description: Generates beginner Rust code with thorough explanations of ownership, borrowing, and the type system compared to TypeScript. Use when writing Rust code, learning Rust fundamentals, or understanding differences between Rust and TypeScript.
---

# Rust — Génération pédagogique (comparaison TypeScript)

## Concept clé : Ownership (pas de garbage collector)

En TypeScript, la mémoire est gérée automatiquement.
En Rust, tu déclares qui possède quoi — le compilateur vérifie tout à la compilation.

```rust
// Move : s1 est "déplacé" dans s2, s1 n'est plus utilisable
let s1 = String::from("hello");
let s2 = s1; // s1 est "moved"
// println!("{}", s1); // ERREUR de compilation

// Clone : copie explicite (comme JSON.parse(JSON.stringify(obj)) en TS)
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{} {}", s1, s2); // les deux sont valides
```

## Borrowing (emprunt — référence sans transfert de propriété)

```rust
// Référence immutable : &T
let s = String::from("hello");
let len = calculate_length(&s); // emprunt temporaire
println!("{} a {} caractères", s, len); // s toujours valide

fn calculate_length(s: &String) -> usize { s.len() }

// Référence mutable : &mut T
let mut s = String::from("hello");
change(&mut s);

fn change(s: &mut String) { s.push_str(", world"); }
```

## Types de base vs TypeScript

| TypeScript | Rust |
|---|---|
| number | i32, i64, f64, usize |
| string | String (heap) ou &str (référence) |
| boolean | bool |
| null / undefined | Option<T> : Some(val) ou None |
| T ou throw Error | Result<T, E> : Ok(val) ou Err(err) |
| any[] | Vec<T> |

## Option et Result (gestion d'erreurs sans exceptions)

```rust
// Option<T> — equivalent T | null en TypeScript
fn find_user(id: &str) -> Option<String> {
    if id == "123" { Some(String::from("Alice")) } else { None }
}

match find_user("123") {
    Some(user) => println!("Trouvé : {}", user),
    None => println!("Introuvable"),
}

// ? opérateur — propagation automatique (comme throw en TypeScript)
fn process() -> Result<(), String> {
    let num = parse_number("42")?; // retourne Err immédiatement si Err
    println!("Nombre : {}", num);
    Ok(())
}
```

## Struct (équivalent interface + classe TypeScript)

```rust
struct User { id: String, name: String, age: u32 }

impl User {
    fn new(id: &str, name: &str, age: u32) -> Self {
        User { id: id.to_string(), name: name.to_string(), age }
    }

    fn greet(&self) -> String {
        format!("Je suis {} et j'ai {} ans", self.name, self.age)
    }
}
```
