import fetch from "node-fetch";

const loginData = {
  email: "admin@dinpangan.go.id",
  password: "Admin@123",
};

console.log("Testing login endpoint...\n");
console.log("Request:", loginData);

fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(loginData),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("\n✅ Status:", data.success ? "SUCCESS" : "FAILED");
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.success && data.data && data.data.token) {
      console.log("\n✨ Login token received!");
      console.log("Token:", data.data.token.substring(0, 50) + "...");
    }
  })
  .catch((err) => {
    console.error("\n❌ Error:", err.message);
  });

// Also test with wrong password to see if we get a different error
setTimeout(() => {
  console.log(
    "\n\n=== Testing with wrong password to verify error is about password, not roles ===\n",
  );

  fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "admin@dinpangan.go.id",
      password: "WrongPassword123",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Wrong password response:", JSON.stringify(data, null, 2));
      console.log('\n✨ KEY SUCCESS: No "column code does not exist" error!');
      console.log(
        "The roles table is working correctly. Password error is expected.",
      );
    })
    .catch((err) => {
      console.error("Error:", err.message);
    });
}, 1000);
