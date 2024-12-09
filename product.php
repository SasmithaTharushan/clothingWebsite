<?php
include_once "connection.php";

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Sanitize and validate input data
    $product_id = mysqli_real_escape_string($conn, $_POST['product-id']);
    $product_name = mysqli_real_escape_string($conn, $_POST['product-name']);
    $product_quantity = (int)$_POST['product-quantity'];
    $product_category = mysqli_real_escape_string($conn, $_POST['product-category']);
    $product_subcategory = mysqli_real_escape_string($conn, $_POST['product-subcategory']);
    $sku_code = mysqli_real_escape_string($conn, $_POST['sku-code']);
    $product_description = mysqli_real_escape_string($conn, $_POST['product-description']);
    $product_discount = (int)$_POST['product-discount'];
    
    // Handle file upload for product image
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] == 0) {
        $image_name = $_FILES['product-image']['name'];
        $image_tmp = $_FILES['product-image']['tmp_name'];
        $image_size = $_FILES['product-image']['size'];
        $image_type = $_FILES['product-image']['type'];

        // Validate image type and size
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        if (in_array($image_type, $allowed_types) && $image_size < 5000000) { // max 5MB
            // Generate a unique name for the image
            $image_path = 'uploads/' . uniqid() . '-' . basename($image_name);

            // Move the uploaded image to the desired directory
            if (move_uploaded_file($image_tmp, $image_path)) {
                // Image uploaded successfully
            } else {
                echo "Error uploading image.";
                exit;
            }
        } else {
            echo "Invalid image file type or size.";
            exit;
        }
    } else {
        // If no image uploaded, set to NULL
        $image_path = NULL;
    }

    // Prepare the SQL query to insert the product data
    $sql = "INSERT INTO products (product_id, product_name, product_image, product_quantity, product_category, product_subcategory, sku_code, product_description, product_discount) 
            VALUES ('$product_id', '$product_name', '$image_path', $product_quantity, '$product_category', '$product_subcategory', '$sku_code', '$product_description', $product_discount)";

    // Execute the query
    if (mysqli_query($conn, $sql)) {
        header("Location: viewproduct.php");
    } else {
        echo "Error: " . mysqli_error($conn);
    }
}
?>

