<div style="display:none;" id="trans_con">
    <span>
        <button id="add_trans">Add</button> | <button id="see_more">See More</button>
    </span>
    <form style="display:none;" id="add_form" action="get_proxy.php">
        <input type="hidden" name="command" value="CreateTransaction">
        <table>
            <tr>
                <td>
                    <input required type="date" name="created" placeholder="Date">
                </td>
                <td>
                    <input required type="text" name="amount" placeholder="Amount">
                </td>
                <td>
                    <input required type="text" name="merchant" placeholder="Merchant">
                </td>
                <td>
                    <input type="text" name="comment" placeholder="Comments...">
                </td>
                <td>
                    <button type="submit">Add</button>
                    <button type="reset">Reset</button>
                    <button type="button" id="cancel_add">Cancel</button>
                </td>
            </tr>
        </table>
    </form>
    <form id="show_form">
        <input type="hidden" name="command" value="Get">
        <input type="hidden" name="returnValueList" value="transactionList">
            <table>
                <tr>
                    <td>
                        <input required type="date" name="startDate" placeholder="Start Date">
                    </td>
                    <td>
                        <input required type="date" name="endDate" placeholder="End Date">
                    </td>
                    <td>
                        <button type="submit">Show</button>
                        <button type="reset">Reset</button>
                        <button type="button" id="show_all">Show All</button>
                    </td>
                </tr>
            </table>
    </form>
    <table id="trans_table"></table>
</div>
