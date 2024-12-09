<?php
$servername = "localhost";
$username = "root";
$password = ""; // Empty password
$dbname = "login_register_db"; // Ensure this database exists

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
    if ($stmt) {
        $stmt->bind_param("ss", $email, $password); // 'ss' means both parameters are strings

        if ($stmt->execute()) {
            // Redirect to login page after successful registration
            header("Location: login.php");
            exit();
        } else {
            echo "Error: " . $stmt->error;
        }

        $stmt->close();
    } else {
        echo "Prepared statement failed: " . $conn->error;
    }
}

$conn->close();
?>
