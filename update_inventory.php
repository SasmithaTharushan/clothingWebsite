<?php
include_once "connection.php";

// Check if the required POST variables are set
if (isset($_POST['product_id']) && isset($_POST['action'])) {
    $productId = $_POST['product_id'];
    $action = $_POST['action'];

    // Fetch the current quantity of the product from the database
    $query = "SELECT product_quantity FROM products WHERE product_id = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $productId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $currentQuantity);
    mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);

    // Determine the new quantity based on the action
    if ($action === "increase") {
        $newQuantity = $currentQuantity + 1;
    } elseif ($action === "decrease" && $currentQuantity > 0) {
        $newQuantity = $currentQuantity - 1;
    } else {
        // Invalid action or trying to decrease quantity below zero
        echo "Invalid action or insufficient quantity.";
        exit;
    }

    // Update the product quantity in the database
    $updateQuery = "UPDATE products SET product_quantity = ? WHERE product_id = ?";
    $updateStmt = mysqli_prepare($conn, $updateQuery);
    mysqli_stmt_bind_param($updateStmt, "ii", $newQuantity, $productId);
    mysqli_stmt_execute($updateStmt);
    mysqli_stmt_close($updateStmt);

    // Redirect back to the view product page or manage inventory page
    header("Location: viewproduct.php");
    exit;
} else {
    echo "Required data not provided.";
    exit;
}

// Close the database connection
mysqli_close($conn);
?>
