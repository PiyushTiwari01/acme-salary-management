\# ACME Salary Management



A web-based employee salary management and compensation analytics platform designed for an HR Manager managing approximately 10,000 employees across multiple countries.



\## Features



\* Employee management

\* Employee search

\* Country filtering

\* Department filtering

\* Pagination

\* Create employee

\* Update employee

\* Delete employee

\* Salary dashboard

\* Country-level analytics

\* Department-level analytics

\* 10,000 employee seed script

\* Automated backend tests



\## Tech Stack



\### Backend



\* Python

\* FastAPI

\* SQLAlchemy

\* Pydantic

\* SQLite



\### Frontend



\* React

\* Vite

\* Axios

\* CSS



\## Project Structure



```text

acme-salary-management/

├── backend/

│   ├── app/

│   └── tests/

├── frontend/

├── docs/

│   ├── requirements.md

│   ├── architecture.md

│   ├── tradeoffs.md

│   └── ai-usage.md

├── README.md

└── .gitignore

```



\## Backend Setup



Open a terminal:



```powershell

cd backend

```



Install dependencies:



```powershell

pip install -r requirements.txt

```



Seed 10,000 employees:



```powershell

python -m app.db.seed

```



Run the API:



```powershell

uvicorn app.main:app --reload

```



Backend:



```text

http://127.0.0.1:8000

```



API documentation:



```text

http://127.0.0.1:8000/docs

```



\## Frontend Setup



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Open the URL shown by Vite.



\## Tests



From the backend directory:



```powershell

pytest

```



\## API Endpoints



\### Employees



```text

GET    /employees

GET    /employees/{employee\_id}

POST   /employees

PUT    /employees/{employee\_id}

DELETE /employees/{employee\_id}

GET    /employees/filters/options

```



\### Analytics



```text

GET /analytics/summary

GET /analytics/by-country

GET /analytics/by-department

```



\### Dashboard



```text

GET /api/dashboard/summary

```



\### Health



```text

GET /health

```



\## Performance Considerations



The employee listing uses server-side pagination.



Search and filtering are performed at the API/database layer instead of loading all 10,000 records into the browser.



\## Testing



The project contains automated tests covering core employee and salary-related functionality.



\## Assessment Artifacts



Additional engineering decisions are documented in:



\* `docs/requirements.md`

\* `docs/architecture.md`

\* `docs/tradeoffs.md`

\* `docs/ai-usage.md`



\## Future Improvements



Potential production enhancements include:



\* Enterprise authentication

\* Role-based authorization

\* PostgreSQL

\* Salary history and audit logs

\* Bulk Excel import/export

\* Advanced compensation analytics

\* CI/CD

\* Centralized logging and monitoring



