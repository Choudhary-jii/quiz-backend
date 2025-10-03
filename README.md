# Quiz Backend

## Introduction
This is a small Quiz backend.  
It exposes REST APIs to create quizzes, add questions (single-choice / multiple-choice / text), fetch public quiz questions (without revealing correct answers), and submit answers to receive a score. The codebase is TypeScript-first and structured for clarity and maintainability.

---

## Tech stack
- **Node.js** + **TypeScript**  
- **Express** — REST API  
- **Prisma** ORM → **PostgreSQL** (Prisma client generated to `./generated/prisma`)  
- **Zod** — request validation  
- **Jest** + **Supertest** — tests (unit & integration)  
- **UUIDs** used for all primary keys

---

## Quick start — Setup & run locally (step-by-step)


> From project root. Assumes `node` (v16+), `npm`, and `psql`/`createdb` available.


1. **Clone repository**

```
git clone https://github.com/Choudhary-jii/quiz-backend.git
```

```
cd quiz-backend
```
2. **Install dependencies**
```
npm ci
```

3. **Create a Postgres database**
```
createdb vertoquiz
```
4. **Create .env (project root)**
   
```
touch .env
```

5. **Set this variables in .env**
   
```
DATABASE_URL="postgresql://<db_user>:<db_passwoed>@localhost:5432/vertoquiz"
PORT=4000
```
>If your password contains special characters (e.g. @), URL-encode or wrap the string in quotes.

6. **Generate Prisma client**
```
npx prisma generate
```
>Note: this project uses a custom Prisma generator output (generated/prisma) — npx prisma generate will produce the client into that folder.

7. **Start dev server**
```
npm run dev
```

---
## Repo contents (important files & folders)

<details>
<summary>📂 Root</summary>



</details>

---

<details>
<summary>📂 prisma/</summary>
</details>

---

<details>
<summary>📂 generated/prisma/</summary>
</details>

---

<details>
<summary>📂 src/</summary>

</details>

---

<details>
<summary>📂 tests/</summary>
</details>

---

## Tests — how to run

>Important -  Integration tests require a real DB. Use a test DB or SQLite for CI/local test runs.

**Run all tests (fast, no DB)**
> Go to ```../test/ ```
```
NODE_ENV=test npx jest
```
---
## What this project implements (requirements mapping)

**Core Features**

1. ***Quiz Management***


    - ```POST /api/quizzes``` — create a quiz (title)

    - ```POST /api/quizzes/<:quizId>/questions``` — add a question (SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT) and options where relevant (options contain text and isCorrect in request)

2. ***Quiz Taking***

    - ```GET /api/quizzes/<:quizId>/questions``` — fetch public quiz questions. Correct answers are not included in response objects.

    - ```POST /api/quizzes/<:quizId>/submit``` — submit answers (array of { questionId, selectedOptionIds?, textAnswer? }) and receive scoring { score, total, details, submissionId }

**Bonus Features**

1. ***Validation:***

     - ```SINGLE_CHOICE``` must have exactly 1 correct option

    - ```MULTIPLE_CHOICE``` must have ≥1 correct option

    - ```TEXT``` must not contain options

    - Text answers max 300 characters

2. ```GET /api/quizze*```— list all quizzes

3. Tests:
    - ```scoring.unit.test.ts``` covers scoring logic.
    - ```integration.api.test.ts``` covers the full flow (create quiz → add questions → fetch → submit).


## Postman API documentation
>Full API doc & examples are available here:
**https://documenter.getpostman.com/view/39033838/2sB3QGtX1y**


## Assumptions & design choices

- ```isCorrect``` stored in DB but never returned in public responses — anti-cheating measure. DTO mappers strip it before sending responses

- ```TEXT``` question answers are flagged for manual review (no automatic NLP scoring).

- ```MULTIPLE_CHOICE``` correctness requires exact set match (no partial credit).

- Submissions are persisted with ```selectedOptionIds``` as JSON for audit.

- Prisma chosen for type-safe DB access and great developer experience.

- Zod used for request validation and helpful error messages.

- DTO mappers used to control public responses and avoid leaking internal flags.


## Troubleshooting (common issues)

- @prisma/client did not initialize yet — run ```npx prisma generate```.
- ***Prisma can't find schema*** — ensure you're running commands from repo root where prisma/schema.prisma exists.
- ***Prisma can't find schema*** — ensure you're running commands from repo root where prisma/schema.prisma exists.
