\# Engineering Trade-offs



\## SQLite vs PostgreSQL



SQLite was selected for the assessment because it keeps setup simple and makes the application easy to run locally and evaluate.



For a production environment with higher concurrency and availability requirements, PostgreSQL would be preferred.



\## Simple Layered Architecture vs Over-engineering



The application uses a straightforward FastAPI + SQLAlchemy structure instead of introducing unnecessary microservices.



The assessment focuses on engineering judgment, correctness, maintainability, and product functionality rather than infrastructure complexity.



\## Server-side Pagination



The system does not load all 10,000 employees into the browser.



Pagination is handled by the API so that only the required records are transferred to the frontend.



\## Database-side Filtering



Search and filters are executed by the backend/database rather than downloading all employee records and filtering in React.



This reduces network usage and improves scalability.



\## Current Salary vs Salary History



The first version stores the current salary because the assessment focuses on salary management and organizational compensation analysis.



A production system would likely maintain an immutable compensation history and audit trail.



\## Currency Handling



Salary values retain their original currency.



Automatic conversion was intentionally excluded because reliable currency conversion requires exchange-rate data, refresh policies, rounding rules, and handling of historical rates.



\## Authentication



Authentication and role-based authorization are outside the assessment scope.



In a production environment, the application should integrate with the organization's identity provider and enforce HR-specific authorization.



\## Seed Data



Synthetic employee data is used to demonstrate behavior with 10,000 records without exposing real employee information.



