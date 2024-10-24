// Import the necessary modules
import fetch from 'node-fetch';  // Make sure to use fetch for server-side requests if not available globally

(function(jQuery) {
    "use strict";
    jQuery(window).on('load', function(e) {
        jQuery('p:empty').remove();
        jQuery("#gen-loading").fadeOut();
        jQuery("#gen-loading").delay(0).fadeOut("slow");

        jQuery('#gen-seacrh-btn').on('click', function() {
            jQuery('.gen-search-form').slideToggle();
            jQuery('.gen-search-form').toggleClass('gen-form-show');
            if (jQuery('.gen-search-form').hasClass("gen-form-show")) {
                jQuery(this).html('<i class="fa fa-times"></i>');
            } else {
                jQuery(this).html('<i class="fa fa-search"></i>');
            }
        });

        jQuery('.gen-account-menu').hide();
        jQuery('#gen-user-btn').on('click', function(e) {
            jQuery('.gen-account-menu').slideToggle();
            e.stopPropagation();
        });

        jQuery('body').on('click', function() {
            if (jQuery('.gen-account-menu').is(":visible")) {
                jQuery('.gen-account-menu').slideUp();
            }
        });

        jQuery("#gen-toggle-btn").on('click', function() {
            jQuery('#gen-sidebar-menu-contain').toggleClass("active");
        });
        jQuery('.gen-toggle-btn').click(function() {
            jQuery('body').addClass('gen-siderbar-open');
        });
        jQuery('.gen-close').click(function() {
            jQuery('body').removeClass('gen-siderbar-open');
        });

        var view_width = jQuery(window).width();
        if (!jQuery('header').hasClass('gen-header-default') && view_width >= 1023) {
            var height = jQuery('header').height();
            jQuery('.gen-breadcrumb').css('padding-top', height * 1.3);
        }

        if (jQuery('header').hasClass('gen-header-default')) {
            jQuery(window).scroll(function() {
                var scrollTop = jQuery(window).scrollTop();
                if (scrollTop > 300) {
                    jQuery('.gen-bottom-header').addClass('gen-header-sticky animated fadeInDown animate__faster');
                } else {
                    jQuery('.gen-bottom-header').removeClass('gen-header-sticky animated fadeInDown animate__faster');
                }
            });
        }

        if (jQuery('header').hasClass('gen-has-sticky')) {
            jQuery(window).scroll(function() {
                var scrollTop = jQuery(window).scrollTop();
                if (scrollTop > 300) {
                    jQuery('header').addClass('gen-header-sticky animated fadeInDown animate__faster');
                } else {
                    jQuery('header').removeClass('gen-header-sticky animated fadeInDown animate__faster');
                }
            });
        }

        jQuery('#back-to-top').fadeOut();
        jQuery(window).on("scroll", function() {
            if (jQuery(this).scrollTop() > 250) {
                jQuery('#back-to-top').fadeIn(1400);
            } else {
                jQuery('#back-to-top').fadeOut(400);
            }
        });

        jQuery('#top').on('click', function() {
            jQuery('top').tooltip('hide');
            jQuery('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });

        if (jQuery('.tv-show-back-data').length) {
            var url = jQuery('.tv-show-back-data').data('url');
            console.log(url);
            var html = '';
            html += `<div class="tv-single-background">
                <img src="` + url + `">
            </div>`;
            jQuery('#main').prepend(html);
        }
    });
})(jQuery);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pms_register-form");
    const formContainer = document.querySelector('.pms-form-fields-wrapper'); // Container where the Pay Now button will be added

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Collect form data
        const formData = {
            whatsapp: document.getElementById('whatsapp').value,
            user_email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            uid: document.getElementById('uid').value,
            uid2: document.getElementById('uid2').value,
            uid3: document.getElementById('uid3').value,
            uid4: document.getElementById('uid4').value,
            account: document.getElementById('account').value,
            account2: document.getElementById('account2').value,
            account3: document.getElementById('account3').value,
            account4: document.getElementById('account4').value,
            subscription_plans: document.querySelector('input[name="subscription_plans"]:checked').value
        };

        try {
            // Make a POST request to the backend
            const response = await fetch('https://www.dextradtechnologies.co.za/customers/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Parse response as JSON
            const data = await response.json();
            if (response.ok && data.payfastLink) {
                // Clear the form and show a "Pay Now" button
                form.reset();

                // Remove any existing "Pay Now" button if it exists
                const existingButton = document.getElementById('pay-now-button');
                if (existingButton) {
                    existingButton.remove();
                }

                // Create a "Pay Now" button
                const payNowButton = document.createElement('button');
                payNowButton.id = 'pay-now-button';
                payNowButton.innerText = 'Pay Now';
                payNowButton.style.padding = '10px 20px';
                payNowButton.style.fontSize = '16px';
                payNowButton.style.backgroundColor = '#28a745';
                payNowButton.style.color = '#fff';
                payNowButton.style.border = 'none';
                payNowButton.style.cursor = 'pointer';

                // Add a click event to redirect to the PayFast payment link
                payNowButton.addEventListener('click', () => {
                    window.location.href = data.payfastLink;
                });

                // Append the "Pay Now" button to the form container
                formContainer.appendChild(payNowButton);
            } else {
                console.error('Error: ' + (data.message || 'An unknown error occurred.'));
                alert('Error: ' + (data.message || 'An unknown error occurred.'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form: ' + error.message);
        }
    });
});
