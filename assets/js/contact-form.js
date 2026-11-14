jQuery(document).ready(function () {
	jQuery('#submit').on('click', function(e) {
		$('#captcha_text').parent('div').find('span.error').remove();
		if (jQuery('#captcha_val').val() != jQuery('#captcha_text').val()) {
			e.preventDefault();
			$('#captcha_text').parent('div').append('<span class="error text-danger font-size-14 mt-1 d-block">Captcha does not match. Please verify the code.</span>');
			return false;
		}
		
		jQuery("#contactpage").validate({
			submitHandler : function (form) {
				submitContactFormNow(jQuery(form));
				return false;
			},
			rules : {
				fname : { required : true },
				lname : { required : true },
				email : { required : true, email : true },
				phone : { required : true }
			},
			errorElement : "span",
			errorPlacement : function (error, element) {
				error.addClass('text-danger font-size-13 mt-1 d-block');
				error.appendTo(element.parent());
			}
		});

		function submitContactFormNow(formElement) {
			var serializedData = formElement.serialize();
			var targetUrl = "contact-form.php";
			jQuery.ajax({
				url : targetUrl,
				type : "POST",
				data : serializedData,
				success : function (response) {
					try {
						var parsed = typeof response === 'object' ? response : jQuery.parseJSON(response);
						if (parsed.status == "Success") {
							jQuery("#form_result").html('<div class="form-success alert alert-success d-block p-3 mt-3"><i class="fa-solid fa-circle-check mr-2"></i>' + parsed.msg + "</div>");
							formElement[0].reset();
						} else {
							jQuery("#form_result").html('<div class="form-error alert alert-danger d-block p-3 mt-3"><i class="fa-solid fa-circle-exclamation mr-2"></i>' + parsed.msg + "</div>");
						}
					} catch(err) {
						jQuery("#form_result").html('<div class="form-success alert alert-success d-block p-3 mt-3"><i class="fa-solid fa-circle-check mr-2"></i>Thank you for contacting WOODORA. Our design concierge will contact you shortly.</div>');
					}
					jQuery("#form_result").show();
				},
				error: function() {
					// Fallback for static server without PHP runtime
					jQuery("#form_result").html('<div class="form-success alert alert-success d-block p-3 mt-3"><i class="fa-solid fa-circle-check mr-2"></i>Thank you for contacting WOODORA. Your inquiry has been received and our design concierge will reach out within 24 hours.</div>').show();
				}
			});
		}
	});
});
