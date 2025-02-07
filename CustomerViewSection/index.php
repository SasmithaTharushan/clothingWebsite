<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Discover the latest trends in fashion for 
    women and men at SA FashionStyle. Shop our wide selection of clothes, bags,
    jewelry, and more. Elevate your style with our curated collections.">
    <meta name="keywords" content="clothes, women, men, fashion, bags, jewelry, SA FashionStyle, latest trends, stylish clothing, accessories">
    <meta name="author" content="SA_FashionStyle">
    <link rel="icon" href="images/logowhite.jpg" type="image/x-icon">
    <!-- css -->
    <link rel="stylesheet" href="Style/style.css">
    <link rel="stylesheet" href="Style/main.css">
    <!-- Google font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    <!-- icon -->
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    <title>piyarathana</title>
</head>
<body>
    <header class="container" id="header">
        <div class="header_top">
              <div class="header_social">
                <a href="https://www.instagram.com/piyarathna_tex/profilecard/?igsh=MXJrOTBjNDliMDhodA==" target="_blank">
                    <ion-icon name="logo-instagram"></ion-icon>
                </a>
                <a href="https://www.facebook.com/piyarathna.tex.mg?mibextid=ZbWKwL" target="_blank">
                    <ion-icon name="logo-facebook"></ion-icon>
                </a>
                <a href="https://wa.me/+94762627603" target="_blank">
                    <ion-icon name="logo-whatsapp"></ion-icon>
                </a>
              </div>
              <img src="images/logo_block.jpg" alt="page logo" id="logo">
              <div class="header_actions">
                   <div id="display_login">
                     <a href="#" id="logout" onclick="logout();">
                       <span id="signout">Sign Out</span>
                       <ion-icon name="log-out-outline"></ion-icon>
                     </a>
                   </div>
                   <a href="login.html" title="Login" id="login_btn">
                     <ion-icon name="person-circle-outline"></ion-icon>
                   </a>
                   <a href="#" class="icon-cart">
                     <ion-icon name="cart-outline"></ion-icon>
                     <span id="cart-counter">0</span>
                   </a>
              </div>
        </div>
        <nav id="navbar">
            <menu>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="products.html">Shop</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </menu>
        </nav>
    </header>
    <button id="scrollBtn"><ion-icon name="arrow-up-outline" id="btn-up"></ion-icon></button>
    <!-- slider -->
    <div class="slider">
        <div class="slides">
            <div class="slide">
                <div class="slide-content">
                   <img src="images/background/slide16_bdfdea89-9df3-48da-9f0a-888fd50a83d5.webp">
                   <div class="text">
                    <h2>Get up to 30% Off New Arrivals</h2>
                    <a href="products.html" class="shop-btn">Shop Now</a>
                   </div>
                </div>
                <div class="slide-content">
                    <img src="images/background/background2.webp">
                    <div class="text">
                     <h2>Get up to 30% Off New Arrivals</h2>
                     <a href="products.html" class="shop-btn">Shop Now</a>
                    </div>
                 </div>
                 <div class="slide-content">
                    <img src="images/background/background3.webp">
                    <div class="text">
                     <h2>Get up to 30% Off New Arrivals</h2>
                     <a href="products.html" class="shop-btn">Shop Now</a>
                    </div>
                 </div>
            </div>
        </div>
        <div class="navigation">
            <button class="prev" onclick="prevSlider();">
                <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
            <button class="next" onclick="nextSlider();">
                <ion-icon name="arrow-forward-outline"></ion-icon>
            </button>
        </div>
    </div>
    <div class="hero_for_phone">
        <div class="hero-content">
            <img src="images/background/phone.webp">
            <div class="text">
             <h2>Mini Collection</h2>
             <p>Colour the summer in hot fuschia, bubblegum pink</p>
             <a href="products.html" class="shop-btn">Shop Now</a>
            </div>
         </div>
    </div>
    <!-- cart -->
    <div class="cart-section">
        <div class="cart-header">
            <h2>SHOPPING CART</h2>
            <div class="closeCart">
                <ion-icon name="close-outline" id="closeCart"></ion-icon>
            </div>
        </div>
        <div class="cart_products">
              <!-- add cart products in js -->
        </div>
        <div class="cart_total">
            <h3>Total:</h3>
            <span id="total_price"></span>
        </div>
        <div class="btn_control">
            <button class="viewCart" onclick="viewCart();">View Cart</button>
            <button class="checkout" onclick="checkOut();">Check Out</button>
        </div>
    </div>
    <!-- info -->
    <div class="information">
        <div class="info">
            <div class="info-icon">
                <img src="images/global-distribution.png" alt="global-distribution" >
            </div>
            <div class="info-text">
                <h3>Shipping Worldwide</h3>
                <p> Free shipping on all Colombo order or order above $100</p>
            </div>
        </div>
        <div class="info">
            <div class="info-icon">
                <img src="images/delivery-status.png" alt="delivery-status" >
            </div>
            <div class="info-text">
                <h3>14 Days Return</h3>
                <p>Simply return it within 14 days for an exchange.</p>
            </div>
        </div>
        <div class="info">
            <div class="info-icon">
                <img src="images/check.png" alt="Security" >
            </div>
            <div class="info-text">
                <h3>Security Payment</h3>
                <p>We ensure secure payment with Online bank payments</p>
            </div>
        </div>
        <div class="info">
            <div class="info-icon">
                <img src="images/24-hours-support.png" alt="24-hours-support" >
            </div>
            <div class="info-text">
                <h3>24/7 Support</h3>
                <p>Contact us 24 hours a day, 7 days a week</p>
            </div>
        </div>
    </div>
    <!-- Top Products -->
    <div class="top_products">
        <div class="container">
            <div class="header">
                <h3>Trending Products</h3>
                <p>Follow the most popular trends and get exclusive items from Foesta shop.</p>
            </div>
            <div class="products">
                <?php
                // Include your database connection script
                include('connection.php');
                
                // Query to fetch all products from the database
                $query = "SELECT * FROM products"; // Assuming the table name is 'products'
                $result = mysqli_query($conn, $query);
                
                if ($result) {
                    // Loop through products and display them
                    while ($product = mysqli_fetch_assoc($result)) {
                        $product_name = $product['product_name']; // Assuming column is 'product_name'
                        $product_price = $product['product_price']; // Assuming column is 'product_price'
                        $product_image = $product['product_image']; // Assuming column is 'product_image'
                        $product_id = $product['product_id']; // Assuming column is 'product_id'
                
                        echo "<div class='product-item'>";
                        echo "<img src='images/products/$product_image' alt='$product_name'>";
                        echo "<h4>$product_name</h4>";
                        echo "<p>\$$product_price</p>";
                        echo "<a href='product_details.php?id=$product_id' class='view-product-btn'>View Details</a>";
                        echo "</div>";
                    }
                } else {
                    echo "No products found.";
                }
                
                // Close the database connection
                mysqli_close($conn);
                ?>
                
            </div>
        </div>
    </div>
    <!-- collection -->
    <div class="collection" id="collection" aria-label="collection" data-section>
        <div class="container">
          <ul class="collection-list">
            <li>
              <div class="collection-card has-before hover:shine">

                <h2 class="card-title">Summer Collection</h2>

                <p class="card-text">Starting at $17.99</p>

                <a href="products.html" class="btn-link">
                  <span>Shop Now</span>

                  <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
                </a>

                <div class="has-bg-image" style="background-image: url('images/background/banner1.webp')"></div>
                </div>
            </li>

            <li>
              <div class="collection-card has-before hover:shine">

                <h2 class="card-title">What’s New?</h2>

                <p class="card-text">Get the glow</p>

                <a href="#" class="btn-link">
                  <span>Discover Now</span>

                  <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
                </a>

                <div class="has-bg-image" style="background-image: url('images/background/banner2.webp')"></div>
              </div>
            </li>

            <li>
              <div class="collection-card has-before hover:shine">

                <h2 class="card-title">Buy 1 Get 1</h2>

                <p class="card-text">Starting at $7.99</p>

                <a href="#" class="btn-link">
                  <span>Discover Now</span>
                  <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
                </a>

                <div class="has-bg-image" style="background-image: url('images/background/banner3.webp')"></div>

              </div>
            </li>

          </ul>
        </div>
    </div>
    <!-- news -->
    <div class="news hight">
        <div class="news-text">
            <h4>Newsletter</h4>
            <p>
                Subscribe to our newsletter and get 20% off your first purchase
            </p>
        </div>
        <div class="Subscribe-form">
            <input type="email" name="email" placeholder="Enter Your Email" autocomplete="off">
            <button type="submit" value="submit">
                <img src="images/send.png" alt="send-data" width="30"/>
            </button>
        </div>
    </div>
    <footer class="footer">
         <div class="footer-top">
            <div class="footer-logo">
                <img src="images/logo_block.jpg" alt="logo" width="140">
                <p>The customer is at the heart of our unique business model, which includes design.</p>
            </div>
            <div class="footer-list">
                <div class="list">
                    <h4>SHOPPING</h4>
                    <ul>
                        <li><a href="#">Clothing Store</a></li>
                        <li><a href="#">Trending Shoes</a></li>
                        <li><a href="#">Accessories</a></li>
                        <li><a href="#">Sale</a></li>
                    </ul>
                </div>
                <div class="list">
                    <h4>Customer Services</h4>
                    <ul>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Payment Methods</a></li>
                        <li><a href="#">Delivary</a></li>
                        <li><a href="#">Return & Exchanges</a></li>
                    </ul>
                </div>
    
            </div>
         </div>
        <div class="footer-bottom">
            <p class="footer-company-name">
                © 2024 All right reserved.
                
            </p>
        </div>
    </footer>
    <script src="JavaScript/indx.js"></script>
    <script src="JavaScript/main.js"></script>
    <script src="JavaScript/cart.js"></script>
</body>
</html>