<?php 
include_once "connection.php"; 

// Fetch products from the database
$query = "SELECT * FROM products";
$result = mysqli_query($conn, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="View and manage added products with search functionality.">
    <title>View Added Products</title>
    <link rel="stylesheet" href="viewproduct.css">
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <div class="profile">
                <img src="https://th.bing.com/th/id/OIP.Crq9sn3Qu3HyHwPJi2zW8QHaHa?rs=1&pid=ImgDetMain" alt="Profile">
                <h3>Mary S.</h3>
                <p>Product Manager</p>
            </div>
            <ul class="menu">
                <li><a href="#">Dashboard</a></li>
                <li><a href="product.html">Add Product</a></li>
                <li><a href="viewproduct.php" class="active">View Products</a></li>
                <li><a href="manageproduct.html">Manage Inventory</a></li>
                <li><a href="refund.html">Refunds</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="login.html">Sign Out</a></li>
            </ul>
        </div>
        <div class="content">
            <div class="view-products-section">
                <div class="content-header">
                    <h2>View Added Products</h2>
                    <input
                        type="text"
                        id="search-bar"
                        placeholder="Search products by name or ID..."
                        oninput="searchProducts()"
                    />
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Quantity</th>
                            <th>Category</th>
                            <th>Subcategory</th>
                            <th>SKU</th>
                            <th>Description</th>
                            <th>Discount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="product-list">
                        <?php 
                        // Loop through the products and display them
                        while ($row = mysqli_fetch_assoc($result)) {
                            echo "<tr>
                                    <td>{$row['product_id']}</td>
                                    <td>{$row['product_name']}</td>
                                    <td><img src='{$row['product_image']}' alt='{$row['product_name']}' class='product-image'></td>
                                    <td>{$row['product_quantity']}</td>
                                    <td>{$row['product_category']}</td>
                                    <td>{$row['product_subcategory']}</td>
                                    <td>{$row['sku_code']}</td>
                                    <td>{$row['product_description']}</td>
                                    <td>{$row['product_discount']}%</td>
                                    <td>
                                        <button class='delete-btn' onclick='deleteProduct({$row['id']})'>Delete</button>
                                    </td>
                                </tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // You can add search functionality using JavaScript if needed
        function searchProducts() {
            const query = document.getElementById('search-bar').value.toLowerCase();
            const rows = document.querySelectorAll('#product-list tr');
            rows.forEach(row => {
                const productId = row.cells[0].textContent.toLowerCase();
                const productName = row.cells[1].textContent.toLowerCase();
                if (productId.includes(query) || productName.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>

<?php 
// Close the database connection
mysqli_close($conn);
?>
