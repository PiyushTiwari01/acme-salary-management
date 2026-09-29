\# ACME Salary Management — Requirements



\## 1. Goal



Build a web-based salary management platform that enables ACME's HR Manager to manage employee compensation data for an organization of approximately 10,000 employees across multiple countries.



The system replaces spreadsheet-based salary management with a centralized application that supports employee management, salary visibility, filtering, search, and compensation analytics.



\## 2. User Persona



\### Primary User



HR Manager



The HR Manager needs to:



\* View employee salary information

\* Search for individual employees

\* Filter employees by country and department

\* Add new employees

\* Update employee salary and profile information

\* Remove employee records

\* Understand how compensation is distributed across the organization

\* Analyze salary information by country and department



\## 3. Scope



\### Employee Management



The application will provide:



\* Employee listing with pagination

\* Employee search

\* Country filtering

\* Department filtering

\* Employee details

\* Create employee

\* Update employee

\* Delete employee

\* Validation for required fields

\* Duplicate employee code protection

\* Duplicate email protection



\### Compensation Analytics



The application will provide:



\* Total employee count

\* Salary-related summary metrics

\* Country-level salary analysis

\* Department-level salary analysis

\* Currency-aware salary information



\### Data



The application will include a seed process capable of creating 10,000 employee records for development and demonstration purposes.



\## 4. Product Principles



The solution prioritizes:



1\. Simplicity

2\. Correctness

3\. Maintainability

4\. Fast employee lookup

5\. Clear salary visibility

6\. Usability for HR users

7\. Testability



The system should avoid unnecessary complexity while still demonstrating production-oriented engineering practices.



\## 5. Out of Scope



The following features are deliberately excluded from the first version:



\### Authentication and Authorization



A full enterprise identity system is outside the scope of the assessment. The application assumes an authenticated HR Manager user.



\### Payroll Processing



The application manages salary data but does not calculate payroll, taxes, deductions, bonuses, or employee payslips.



\### Currency Conversion



Salary values are stored with their original currency. Cross-currency normalization is not part of the first version because exchange rates introduce additional external dependencies and business rules.



\### Employee Self-Service



Employees do not directly access or modify their compensation information.



\### Salary History



The initial version stores the current salary state rather than maintaining a complete compensation history/audit timeline.



\### Bulk Excel Import



The goal is to demonstrate replacement of spreadsheet-based management with a structured application. Bulk import can be considered as a future enhancement.



\## 6. Assumptions



\* Each employee has a unique employee code.

\* Each employee has a unique email address.

\* Annual salary must be greater than zero.

\* Salary is stored in the employee's local currency.

\* The organization has approximately 10,000 employees.

\* The initial deployment can use a lightweight relational database.

\* The primary workflow is HR management rather than payroll execution.



\## 7. Success Criteria



The solution is considered successful when an HR Manager can:



\* View thousands of employee records efficiently.

\* Search and filter employees.

\* Create, update, and delete employee records.

\* View meaningful salary analytics.

\* Understand salary distribution by country and department.

\* Use the application without interacting directly with spreadsheets.

\* Run the application with seeded data.

\* Verify core functionality through automated tests.



