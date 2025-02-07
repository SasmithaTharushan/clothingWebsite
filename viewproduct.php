<?php 
include_once "connection.php"; 

// Fetch products from the database for the View Products section
$query = "SELECT * FROM products";
$result = mysqli_query($conn, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}

// Fetch products from the database for the Manage Inventory section
$inventory_query = "SELECT product_id, product_name, product_quantity, product_category FROM products";
$inventory_result = mysqli_query($conn, $inventory_query);

if (!$inventory_result) {
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
    <link rel="stylesheet" href="manageproduct.css">
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
                <li><a href="refund.html">Refunds</a></li>
                <li><a href="settings.html">Settings</a></li>
                <li><a href="login.html">Sign Out</a></li>
            </ul>
            
        </div>
        <div class="content">
            <div class="view-products-section">
                <div class="content-header">
                    <h2>View Added Products</h2>
                    <input type="text" id="search-bar" placeholder="Search products by name or ID..." oninput="searchProducts()">
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
                                        <button class='delete-btn' onclick='deleteProduct({$row['product_id']})'>Delete</button>
                                    </td>
                                </tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>

            <div class="manage-inventory-section">
                <div class="content-header">
                    <h2>Manage Inventory</h2>
                    <input type="text" id="inventory-search-bar" placeholder="Search product by name or ID..." oninput="searchInventory()">
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="inventory-list">
                        <?php 
                        // Loop through the inventory products and display them
                        while ($row = mysqli_fetch_assoc($inventory_result)) {
                            echo "<tr>
                                    <td>{$row['product_id']}</td>
                                    <td>{$row['product_name']}</td>
                                    <td>{$row['product_quantity']}</td>
                                    <td>{$row['product_category']}</td>
                                    <td>
                                        <button class='update-btn' onclick='updateInventory({$row['product_id']}, \"increase\")'>Increase</button>
                                        <button class='update-btn' onclick='updateInventory({$row['product_id']}, \"decrease\")'>Decrease</button>
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
        // Search functionality for products
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

        // Search functionality for inventory
        function searchInventory() {
            const query = document.getElementById('inventory-search-bar').value.toLowerCase();
            const rows = document.querySelectorAll('#inventory-list tr');
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

        // Delete product
        function deleteProduct(productId) {
            var form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', 'delete_product.php');
            form.style.display = 'none';

            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', 'product_id');
            input.setAttribute('value', productId);

            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }

        // Update inventory quantity
        function updateInventory(productId, action) {
            var form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', 'update_inventory.php');
            form.style.display = 'none';

            var inputProductId = document.createElement('input');
            inputProductId.setAttribute('type', 'hidden');
            inputProductId.setAttribute('name', 'product_id');
            inputProductId.setAttribute('value', productId);

            var inputAction = document.createElement('input');
            inputAction.setAttribute('type', 'hidden');
            inputAction.setAttribute('name', 'action');
            inputAction.setAttribute('value', action);

            form.appendChild(inputProductId);
            form.appendChild(inputAction);
            document.body.appendChild(form);
            form.submit();
        }
    </script>
</body>
</html>

<?php 
// Close the database connection
mysqli_close($conn);
?>
