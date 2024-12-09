<?php
// Database connection settings
$servername = "localhost";
$username = "root"; // Default WAMP username
$password = "root"; // Default WAMP password (empty)
$dbname = "clothing_test"; // Your provided database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Get form data and sanitize inputs
  $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
  $password = $_POST['password'];
  $confirm_password = $_POST['confirm_password'];

  // Validate email format
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Invalid email format!";
    exit();
  }

  // Validate password match
  if ($password !== $confirm_password) {
    echo "Passwords do not match!";
    exit();
  }

  // Use prepared statements to prevent SQL injection
  $stmt = $conn->prepare("INSERT INTO User (email, password) VALUES (?, ?)");
  $stmt->bind_param("ss", $email, $password); // 'ss' means both parameters are strings

  if ($stmt->execute()) {
    echo "Registration successful!";
  } else {
    echo "Error: " . $stmt->error;
  }

  // Close the statement
  $stmt->close();
}

// Close the database connection
$conn->close();
?>
