<?php
include_once "connection.php";

if(isset($_POST["product_id"])) {
    $product_id = $_POST["product_id"];
    echo $product_id;
    
    // Use prepared statements to prevent SQL injection
    $sql = "DELETE FROM products WHERE id = ?";
    
    // Prepare the statement
    if ($stmt = mysqli_prepare($conn, $sql)) {
        // Bind the parameters
        mysqli_stmt_bind_param($stmt, "s", $product_id);
        
        // Execute the statement
        if (mysqli_stmt_execute($stmt)) {
            header("Location: viewproduct.php");
            exit;
        } else {
            echo "Error deleting product: " . mysqli_stmt_error($stmt);
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
