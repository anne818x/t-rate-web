<?php
if($_POST){
    $name = $_POST['form_name'];
    $sender = $_POST['form_email'];
    $message = $_POST['form_msg'];
	$recipient = $_POST['form_recipient'];

//send email
    mail($recipient, "This is an email from:" .$email, $message);
}
?>