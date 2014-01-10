<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Expensify Transactions</title>
        <link rel="stylesheet" href="css/expensify_app.css" />
        <script type="text/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="js/expensify_app.js"></script>
    </head>
    <body>
        <div id="header">
            <a href="/">
                <h1 id="title">ExpensifyTransactions</h1>
            </a>
        </div>
        <div id="content">
            <nav  style="display:none;">
                <span id="username"></span><button type="button" id="logout">logout</button>
            </nav>
        <?php
            require_once 'login.php';
            require_once 'content.php';
        ?>
        </div>
    </body>
</html>
