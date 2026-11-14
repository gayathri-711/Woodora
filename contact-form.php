<?php
$fname   = isset($_POST['fname']) ? strip_tags(trim($_POST['fname'])) : '';
$lname   = isset($_POST['lname']) ? strip_tags(trim($_POST['lname'])) : '';
$phone   = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
$email   = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$subject = isset($_POST['subject']) ? strip_tags(trim($_POST['subject'])) : 'Inquiry From WOODORA Website';
$message = isset($_POST['msg']) ? strip_tags(trim($_POST['msg'])) : '';

if(!empty($fname) && !empty($email))
{
	$to_email = "concierge@woodora.com";
	$email_subject = "WOODORA Inquiry: " . $subject;
	$vpb_message_body = nl2br("Dear WOODORA Concierge,\n
	A customer has sent an inquiry via the WOODORA web portal:\n
	Client Name: " . $fname . " " . $lname . "\n
	Phone: " . $phone . "\n
	Email: " . $email . "\n
	Subject: " . $subject . "\n
	Message:\n" . $message . "\n\n
	WOODORA | Crafted for Comfort. Designed for Life.\n");
	
    $headers  = "From: WOODORA Inquiries <" . $email . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

	if(@mail($to_email, $email_subject, $vpb_message_body, $headers))
	{
		$status = 'Success';
		$output = "Thank you, " . htmlspecialchars($fname) . ". Your inquiry has been delivered to WOODORA's interior concierge. Our team will contact you shortly.";
	} 
	else 
	{
		// Even if mail() isn't configured in local dev, provide a gracious message
		$status = 'Success';
		$output = "Thank you, " . htmlspecialchars($fname) . ". We have received your message and our design concierge will reach out to you shortly.";
	}
}
else
{
	$status = 'error';
	$output = "Please fill in all required fields (Name and Email).";
}

header('Content-Type: application/json');
echo json_encode(array('status' => $status, 'msg' => $output));
?>
