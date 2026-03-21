import fetch from "node-fetch";

const registrationData = {
  username: "admin",
  name: "Administrator",
  email: "admin@dinpangan.go.id",
  password: "Admin@123",
  confirmPassword: "Admin@123",
  unit_id: "DINPANGAN",
  role_id: "3b92b758-1521-481e-b22c-a7db0af47ed5", // kepala_dinas from PostgreSQL
};

console.log("Testing registration endpoint...\n");
console.log("Request:", registrationData);

// First, try to delete existing user (if any)
fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@dinpangan.go.id",
    password: "Admin@123",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("\nPre-existing login status:", data.message);

    // Now try to register
    return fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });
  })
  .then((res) => res.json())
  .then((data) => {
    console.log("\n✅ Registration response:");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✨ User registered! Now testing login...");

      // Try login again
      setTimeout(() => {
        fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "admin@dinpangan.go.id",
            password: "Admin@123",
          }),
        })
          .then((res) => res.json())
          .then((loginData) => {
            console.log("\nLogin response after registration:");
            console.log(JSON.stringify(loginData, null, 2));

            if (loginData.success) {
              console.log("\n🎉 SUCCESS! Login is working!");
              console.log("Expected redirect: " + loginData.data.dashboard);
            }
          })
          .catch((err) => console.error("Login error:", err.message));
      }, 500);
    }
  })
  .catch((err) => {
    console.error("\n❌ Error:", err.message);
  });
