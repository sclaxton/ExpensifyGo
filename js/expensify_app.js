// function creates a cookie
// Parameters:
//      cookie_name - name of the cookie to be deleted
//      value - value to be assigned to the cookie
//      hours - integer number of hours before expiration
var createCookie = function (cookie_name, value, hours) {
    var expires;
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime()+(hours*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = cookie_name+"="+value+expires+"; path=/";
};
// get the value of a cookie if it exists otherwise return null
// Parameters:
//      cookie_name - name of the cookie to be deleted
var getCookieValue = function (cookie_name) {
    // add '=' so we get the value when we
    // find the cookies
    var cookie_name_eq = cookie_name + "=";
    var cookie_array = document.cookie.split(';');
    // search through all cookies associated
    // with the domain for this session
    for(var i=0; i < cookie_array.length; i += 1) {
        var cookie = cookie_array[i];
        // find first non-whitespace character of cookie
        while ( cookie.charAt(0) == ' ' ){
            cookie = cookie.substring(1,cookie.length);
        }
        // return corresponding value if cookie key == cookie_name
        if (cookie.indexOf(cookie_name_eq) === 0){
            return cookie.substring(cookie_name_eq.length,cookie.length);
        }
    }
    // otherwise return null
    return null;
};
// function resets cookie to have expired an hour ago
// causing the browser to delete the cookie altogether
// Parameters:
//      cookie_name - name of the cookie to be deleted
var deleteCookie = function (cookie_name) {
    createCookie(cookie_name, "", -1);
};
// function logs out the user
var logoutUser = function (){
    deleteCookie("authToken");
    location.reload(true);
};
// function alerts user of server error
var serverError = function (){
    alert("Expensify failed due to a server error. Refresh and try again.");
};
var defaultStatusObject = {
    407: logoutUser,
    408: logoutUser,
    500: serverError,
    501: serverError,
    502: serverError,
    503: serverError
};
// function adds downloaded transaction to the transactions table
// function has parameters corresponding to the data needed to add
// Parameters:
//      transaction - the transaction object that contains the
//          the transaction data fetched from Expensify
//      table - the table element that displays user transactions
var addTransaction = function (transaction, table) {
    var row = document.createElement("tr");
    table.appendChild(row);
    var date_cell = document.createElement("td");
    date_cell.innerHTML = transaction.created;
    row.appendChild(date_cell);
    var amount_cell = document.createElement("td");
    amount_cell.innerHTML = transaction.amount;
    row.appendChild(amount_cell);
    var merchant_cell = document.createElement("td");
    merchant_cell.innerHTML = transaction.merchant;
    row.appendChild(merchant_cell);
    var comment_cell = document.createElement("td");
    comment_cell.innerHTML = transaction.comment ? transaction.comment : "";
    row.appendChild(comment_cell);
    table.appendChild(row);
};
// function attaches handlers for the creation of new transactions
// function has parameters corresponding to DOM elements involved
// in the creation of a new transaction
// Parameters
//      table - the table element that contains transactions data
//      form - the form which users submit to add new transaction
//          data to the table
//      date - the hidden input which is to contain the date of
//          creation of new transaction
//      add - the button which submits transaction data
//      cancel - button which cancels user input
var addNewTransactionHandlers = function (table, form, add, cancel) {
    $(add).on("click", function (event) {
        add.style.display = "none";
        form.style.display = "";
    });
    $(cancel).on("click", function (event) {
            form.style.display = "none";
            add.style.display = "";
    });
    // ajaxify form submission
    $(form).submit(function(event){
        $.ajax({
            dataType: "json",
            url: form.action,
            data: $(form).serialize(),
            success: function(data){
                var transaction = data["*"];
                addTransaction(transaction, table);
                form.style.display = "none";
                add.style.display = "";
            },
            statusCode: defaultStatusObject,
        });
        return false;
    });
};
// function gets user transaction data from Expensify via
// via the API and displays those transactions in a table
// Parameters:
//      table - the table element that is to contain
//          transaction data
var getUserTransactions = function (table) {
    $.ajax({
        dataType: "json",
        url: "get_proxy.php",
        data: { command: "Get", returnValueList: "transactionList" },
        success: function(data){
            var transactions = data.transactionList;
            transactions.forEach(function (transaction) {
                addTransaction(transaction, table);
            });
        },
        statusCode: defaultStatusObject,
    });
};
// function configures the user's personal transaction
// dashboard. parameters correspond to elements involved
// in the configuration of users personal dashboard
// Parameters:
//      nav - nav element that contains navigation items
//      nav_username - inline element that contains users
//          email address
//      nav_logout - inline element that acts as log out button
//      login_con - container of login form
//      trans_con - container of transaction elements
//      trans_form - form for adding transactions
//      trans_add - button for submission of new transaction data
//      trans_cancel - inline element that cancels transaction on click
var configUser = function (nav, nav_username, nav_logout, login_con,
        trans_con, trans_table, trans_form, trans_add, trans_cancel) {
    // remove login form
    $(login_con).remove();
    // configure nav bar
    username.innerHTML = getCookieValue("email");
    $(nav_logout).on("click", function (event) {
        logoutUser();
    });
    nav.style.display = "";
    // get user transactions to display
    getUserTransactions(trans_table);
    addNewTransactionHandlers(trans_table, trans_form, trans_add, trans_cancel);
    // display transactions container
    trans_con.style.display = "";
};
$(document).ready(function (){
    var authToken = getCookieValue("authToken");
    var trans_con = document.getElementById("trans_con");
    var trans_table = document.getElementById("trans_table");
    var trans_form = document.getElementById("add_form");
    var trans_add = document.getElementById("add_trans");
    var trans_cancel = document.getElementById("cancel_add");
    var nav = document.getElementsByTagName("nav")[0];
    var nav_logout = document.getElementById("logout");
    var nav_username = document.getElementById("username");
    var login_con = document.getElementById("login_con");
    var login_form = document.getElementById("login_form");
    var login_message = document.getElementById("message");
    if (!authToken){
        $(login_form).submit(function(event){
            $.ajax({
                url: login_form.action,
                dataType: "json",
                data: $(login_form).serialize(),
                success: function(data){
                    var email = data.email;
                    var authToken = data.authToken;
                    createCookie("email", email, 1);
                    createCookie("authToken", authToken, 1);
                    configUser(nav, nav_username, nav_logout, login_con,
                        trans_con, trans_table, trans_form, trans_add, trans_cancel);
                },
                statusCode: {
                    401: function (){
                        login_message.innerHTML = "invalid password";
                    },
                    404: function (){
                        login_message.innerHTML = "invalid username";
                    },
                    405: function (){
                        login_message.innerHTML = "unvalidated email";
                    },
                },
            });
            return false;
        });
    }
    else {
        configUser(nav, nav_username, nav_logout, login_con,
            trans_con, trans_table, trans_form, trans_add, trans_cancel);
    }
});
