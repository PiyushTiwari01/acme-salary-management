\# ACME Salary Management — Architecture



\## 1. Architecture Overview



The application follows a simple layered client-server architecture.



```text

┌──────────────────────────────┐

│        React Frontend        │

│                              │

│ Dashboard                    │

│ Employee Management          │

│ Search / Filters             │

│ Salary Analytics             │

└──────────────┬───────────────┘

&#x20;              │ HTTP / JSON

&#x20;              ▼

┌──────────────────────────────┐

│       FastAPI Backend        │

│                              │

│ REST API                     │

│ Validation                   │

│ Business Rules               │

│ Analytics                    │

└──────────────┬───────────────┘

&#x20;              │

&#x20;              ▼

┌──────────────────────────────┐

│        SQLAlchemy ORM        │

└──────────────┬───────────────┘

&#x20;              │

&#x20;              ▼

┌──────────────────────────────┐

│      Relational Database     │

│            SQLite            │

└──────────────────────────────┘

```



\## 2. Frontend



Technology:



\* React

\* Vite

\* Axios

\* CSS



The frontend provides the HR Manager with a dashboard-oriented interface for employee and salary management.



The UI communicates with the backend through REST APIs and does not directly access the database.



\## 3. Backend



Technology:



\* Python

\* FastAPI

\* SQLAlchemy

\* Pydantic



FastAPI exposes REST endpoints for:



\* Employee management

\* Employee search

\* Employee filtering

\* Dashboard summary

\* Salary analytics



Pydantic models provide request and response validation.



\## 4. Database



SQLite is used for the assessment because:



\* It is relational.

\* It requires minimal infrastructure.

\* It is easy to run locally.

\* It is deterministic for evaluation.

\* It is sufficient for demonstrating the application's core behavior.



For a production deployment serving a larger concurrent workload, PostgreSQL would be a natural replacement.



\## 5. Pagination



Employee records are returned using server-side pagination.



The API accepts:



\* `page`

\* `page\_size`



This prevents the frontend from loading all 10,000 employees at once.



\## 6. Search and Filtering



Search and filtering are performed at the database query layer.



Supported search fields include:



\* Employee code

\* First name

\* Last name

\* Email

\* Job title



Supported filters include:



\* Country

\* Department



This approach reduces unnecessary data transfer between the database, backend, and browser.



\## 7. Validation



The API validates:



\* Required employee fields

\* Email format

\* Salary greater than zero

\* Field length constraints

\* Unique employee code

\* Unique email



Invalid requests return appropriate HTTP errors.



\## 8. Seed Data



A dedicated seed script generates 10,000 employee records.



The seed data contains realistic combinations of:



\* Names

\* Countries

\* Departments

\* Job titles

\* Currencies

\* Annual salaries



This allows the application to demonstrate behavior at the expected assessment data volume.



\## 9. Testing Strategy



The backend contains automated tests for core functionality.



Tests are designed to be:



\* Fast

\* Deterministic

\* Independent

\* Easy to understand



The test suite covers employee functionality and salary/currency-related business logic.



\## 10. Future Production Architecture



For a larger production deployment, the architecture could evolve to include:



\* PostgreSQL

\* Redis caching where appropriate

\* Enterprise authentication

\* Role-based authorization

\* Audit logging

\* Centralized observability

\* Background jobs

\* Object storage for imports/exports

\* CI/CD

\* Horizontal API scaling



