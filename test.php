<?php
// Database credentials
$servername = "localhost"; // Your server address
$username = "root";    // Your database username
$password = "root";    // Your database password
$dbname = "clothing_test"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";

// Close connection
$conn->close();
?>
