<?php
include_once "connection.php";

if(isset($_POST["email"])) {
    $email = $_POST["email"];
    $password = $_POST["password"];
    
    // Use prepared statements to prevent SQL injection
    $sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    
    // Prepare the statement
    if ($stmt = mysqli_prepare($conn, $sql)) {
        // Bind the parameters
        mysqli_stmt_bind_param($stmt, "ss", $email, $password);
        
        // Execute the statement
        if (mysqli_stmt_execute($stmt)) {
            header("Location: login.html");
        } else {
            echo "Error: " . mysqli_stmt_error($stmt);
        }
        
        // Close the statement
        mysqli_stmt_close($stmt);
    } else {
        echo "Error preparing statement: " . mysqli_error($conn);
    }
    
    // Close the connection
    mysqli_close($conn);
}
?>
