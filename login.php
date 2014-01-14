<div id="login_con">
    <form id="login_form" action="get_proxy.php">
        <input type="hidden" name="command" value="Authenticate" />
        <table>
            <tr>
                <td>
                    <input required type="text" placeholder="Username"  name="partnerUserID" />
                </td>
            </tr>
            <tr>
                <td>
                    <input required type="password" placeholder="Password"  name="partnerUserSecret" />
                </td>
            </tr>
            <tr>
                <td>
                    <button type="submit">Login</button>
                </td>
            </tr>
            <tr>
                <td>
                    <span id="message"></span>
                </td>
            </tr>
        </table>
    </form>
</div>
