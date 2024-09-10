
/*====================================
[  Table of contents  ]
======================================
==> Page Loader
==> Search Button
==> Sidebar Toggle
==> Sticky Header
==> Back To Top
======================================
[ End table content ]
======================================
*/
(function(jQuery) {
    "use strict";
    jQuery(window).on('load', function(e) {

        jQuery('p:empty').remove();

        /*------------------------
                Page Loader
        --------------------------*/
        jQuery("#gen-loading").fadeOut();
        jQuery("#gen-loading").delay(0).fadeOut("slow");
        /*------------------------
                Search Button
        --------------------------*/
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
            // jQuery('.gen-account-menu').toggleClass('gen-form-show');
            // if (jQuery('.gen-account-menu').hasClass("gen-form-show")) {
            //     jQuery(this).html('<i class="fa fa-times"></i>');
            // } else {
            //     jQuery(this).html('<i class="fa fa-user"></i>');
            // }
        });

        jQuery('body').on('click' , function(){
            if(jQuery('.gen-account-menu').is(":visible"))
            {
                jQuery('.gen-account-menu').slideUp();
            }
        });
        /*------------------------
                Sidebar Toggle
        --------------------------*/
        jQuery("#gen-toggle-btn").on('click', function() {
            jQuery('#gen-sidebar-menu-contain').toggleClass("active");
        });
        jQuery('.gen-toggle-btn').click(function() {
            jQuery('body').addClass('gen-siderbar-open');
        });
        jQuery('.gen-close').click(function() {
            jQuery('body').removeClass('gen-siderbar-open');
        });
        /*------------------------
                Sticky Header
        --------------------------*/
        var view_width = jQuery(window).width();
        if (!jQuery('header').hasClass('gen-header-default') && view_width >= 1023)
        {
            var height = jQuery('header').height();
            jQuery('.gen-breadcrumb').css('padding-top', height * 1.3);
        }
        if (jQuery('header').hasClass('gen-header-default'))
        {
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
        /*------------------------
                Back To Top
        --------------------------*/
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

        if(jQuery('.tv-show-back-data').length)
        {
            var url = jQuery('.tv-show-back-data').data('url');
            console.log(url);
            var html = '';
            html += `<div class="tv-single-background">
                <img src="`+url+`">
            </div>`;
            jQuery('#main').prepend(html);
           
        }
    });
})(jQuery);

document.getElementById('pms_register-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form data
    const formData = new FormData(this);
    
    // Get the selected package
    const selectedPackage = document.querySelector('input[name="subscription_plans"]:checked');
    
    // Define the payment links for each package
    const paymentLinks = {
        '7330': 'https://payf.st/gdxob',  // Payment link for Premium package
        '7329': 'https://payf.st/r5io8', // Payment link for Standard package
        '7328': 'https://payf.st/ba8lq'     // Payment link for Basic package
    };

    // Get the corresponding payment link
    const paymentLink = paymentLinks[selectedPackage.value];

    // Send the form data to Basin
    fetch('https://usebasin.com/f/35927a0ab3b1', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // If the form submission is successful, redirect to the payment link
            window.location.href = paymentLink;
        } else {
            alert('There was an issue submitting the form. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting the form. Please try again.');
    });
});
