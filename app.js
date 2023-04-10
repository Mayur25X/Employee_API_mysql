const express = require("express");
const conn = require("./connection");
const mysql = require("mysql");

const app = express();

// conn.conn.query

// app.use(express.urlencoded())
app.use(express.json());

app.post("/employees", (req, res) => {
  const { name, email, phone, jobT, address, city, state, contacts } = req.body;

  conn.query(
    "INSERT INTO employees (name, email, phone, jobT, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, email, phone, jobT, address, city, state],
    (err, result) => {
      if (err) {
        console.error("Error creating employee:", err);
        res.status(500).send("Error creating employee");
      } else {
        const employeeId = result.insertId;

        if (contacts && contacts.length > 0) {
          const contactsValues = contacts.map((contact) => [
            contact.Ename,
            contact.Ephone,
            contact.relation,
            employeeId,
          ]);

          conn.query(
            "INSERT INTO contacts (Ename, Ephone, relation, employee_id) VALUES ?",
            [contactsValues],
            (err, result) => {
              if (err) {
                console.error("Error creating contacts:", err);
                res.status(500).send("Error creating contacts");
              } else {
                res.status(201).send("Employee created successfully");
              }
            }
          );
        } else {
          res.status(201).send("Employee created successfully");
        }
      }
    }
  );
});

app.get("/employees", (req, res) => {
  conn.query("SELECT * FROM employees", (err, employees) => {
    if (err) {
      console.error("Error getting employees:", err);
      res.status(500).send("Error getting employees");
    } else {
      const employeeIds = employees.map((employee) => employee.id);

      conn.query(
        "SELECT * FROM contacts WHERE employee_id IN (?)",
        [employeeIds],
        (err, contacts) => {
          if (err) {
            console.error("Error getting contacts:", err);
            res.status(500).send("Error getting contacts");
          } else {
            const employeesWithContacts = employees.map((employee) => {
              const employeeContacts = contacts.filter(
                (contact) => contact.employee_id === employee.id
              );
              return {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                jobT: employee.jobT,
                address: employee.address,
                city: employee.city,
                state: employee.state,
                contacts: employeeContacts.filter(
                  (contact) => contact !== null
                ),
              };
            });

            res.status(200).json(employeesWithContacts);
          }
        }
      );
    }
  });
});

app.put("/employees/:id", (req, res) => {
  const employeeId = req.params.id;
  const { name, email, phone, jobT, address, city, state, contacts } = req.body;

  conn.query(
    "UPDATE employees SET name = ?, email = ?, phone = ?, jobT = ?, address = ?, city = ?, state = ? WHERE id = ?",
    [name, email, phone, jobT, address, city, state, employeeId],
    (err, result) => {
      if (err) {
        console.error("Error updating employee:", err);
        res.status(500).send("Error updating employee");
      } else {
        conn.query(
          "DELETE FROM contacts WHERE employee_id = ?",
          [employeeId],
          (err, result) => {
            if (err) {
              console.error("Error deleting contacts:", err);
              res.status(500).send("Error deleting contacts");
            } else {
              if (contacts && contacts.length > 0) {
                const contactsValues = contacts.map((contact) => [
                  contact.Ename,
                  contact.Ephone,
                  contact.relation,
                  employeeId,
                ]);

                conn.query(
                  "INSERT INTO contacts (Ename, Ephone, relation, employee_id) VALUES ?",
                  [contactsValues],
                  (err, result) => {
                    if (err) {
                      console.error("Error creating contacts:", err);
                      res.status(500).send("Error creating contacts");
                    } else {
                      res.status(200).send("Employee updated successfully");
                    }
                  }
                );
              } else {
                res.status(200).send("Employee updated successfully");
              }
            }
          }
        );
      }
    }
  );
});

app.delete("/employees/:id", (req, res) => {
  const employeeId = req.params.id;

  conn.query(
    "DELETE FROM contacts WHERE employee_id = ?",
    [employeeId],
    (err, result) => {
      if (err) {
        console.error("Error deleting contacts:", err);
        res.status(500).send("Error deleting contacts");
      } else {
        conn.query(
          "DELETE FROM employees WHERE id = ?",
          [employeeId],
          (err, result) => {
            if (err) {
              console.error("Error deleting employee:", err);
              res.status(500).send("Error deleting employee");
            } else {
              res.status(200).send("Employee deleted successfully");
            }
          }
        );
      }
    }
  );
});


app.listen(3000, () => {
  console.log("App listening on port 3000!");
});
