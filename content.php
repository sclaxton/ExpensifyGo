<div id="trans_table_con">
    <table id="trans_table"></table>
</div>
<div id="add_con">
    <a id="add_trans">Add</a>
    <form style="display:none;" id="add_form" action="get_proxy.php">
        <input type="hidden" name="commmand" value="CreateTransaction">
        <table>
            <tr>
                <td>
                    <input type="text" name="amount" placeholder="Amount">
                </td>
                <td>
                    <input type="text" name="merchant" placeholder="Merchant">
                </td>
                <td>
                    <input type="text "name="comments" placeholder="Transaction comments...">
                </td>
                <td>
                    <input type="submit" value="Add">
                    <a id="cancel_add">Cancel</a>
                </td>
            </tr>
        </table>
    </form>
</div>

