const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);

            document.getElementById("message").textContent =
                "Login successful";

            getUsers();
        } else {
            document.getElementById("message").textContent =
                data.msg;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

async function getUsers() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:3000/users", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const tableBody = document.getElementById("userTableBody");

            tableBody.innerHTML = "";

            data.forEach(user => {
                const row = document.createElement("tr");

                row.innerHTML = `
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.role}</td>
    <td>
        <button onclick="editUser('${user._id}', '${user.name}', '${user.email}', '${user.role}')">
            Edit
        </button>

        <button onclick="deleteUser('${user._id}')">
            Delete
        </button>
    </td>
`;

                tableBody.appendChild(row);
            });
        } else {
            console.log("Error:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const addUserForm = document.getElementById("addUserForm");

addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const password = document.getElementById("userPassword").value;
    const role = document.getElementById("userRole").value;

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("addMessage").textContent =
                "User added successfully";

            addUserForm.reset();

            getUsers();
        } else {
            document.getElementById("addMessage").textContent =
                data.msg || data.error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

function editUser(id, name, email, role) {
    const newName = prompt("Enter new name:", name);
    const newEmail = prompt("Enter new email:", email);
    const newRole = prompt("Enter role (user/admin):", role);

    if (!newName || !newEmail || !newRole) {
        return;
    }

    updateUser(id, newName, newEmail, newRole);
}

async function updateUser(id, name, email, role) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                email,
                role
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("User updated successfully");
            getUsers();
        } else {
            alert(data.msg || data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteUser(id) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("User deleted successfully");
            getUsers();
        } else {
            alert(data.msg || data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const searchUser = document.getElementById("searchUser");

searchUser.addEventListener("input", () => {
    const searchValue = searchUser.value.toLowerCase();

    const rows = document.querySelectorAll("#userTableBody tr");

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();

        if (name.includes(searchValue) || email.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});



const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");

    document.getElementById("message").textContent =
        "Logged out successfully";

    document.getElementById("userTableBody").innerHTML = "";
});

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("signupMessage").textContent =
                "Signup successful";

            signupForm.reset();
        } else {
            document.getElementById("signupMessage").textContent =
                data.msg || data.error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});