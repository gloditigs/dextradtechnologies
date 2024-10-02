
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



document.getElementById("pms_register-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = document.getElementById("pms_register-form");
    const formData = new FormData(form);

    // Get the selected subscription plan
    const selectedPlan = document.querySelector('input[name="subscription_plans"]:checked').value;

    // Define payment URLs based on the selected plan
    const paymentLinks = {
        "mfc-premium-780": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Premium++12+Months&amount=780&subscription_type=1&recurring_amount=780&cycles=0&frequency=6",
        "mfc-standard-420": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Standard++6+Months&amount=420&subscription_type=1&recurring_amount=420&cycles=0&frequency=5",
        "mfc-basic-74": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+-+Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=Basic+Monthly&amount=75&subscription_type=1&recurring_amount=75&cycles=0&frequency=3",
        "wp-premium-390": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=6+Months&amount=390&subscription_type=1&recurring_amount=390&cycles=0&frequency=5",
        "wp-standard-195": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Months&amount=195&subscription_type=1&recurring_amount=195&cycles=0&frequency=4",
        "wp-basic-74": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3",
        "wp-devices-1-74": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++1+Device+Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=1+Device++Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3",
        "wp-devices-2-140": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Devices+&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3",
        "wp-devices-3-210": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Devices&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3",
        "wp-devices-4-270": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Devices&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3",
        "wp-user-1-770": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+1+User+Yearly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=1+User+&amount=770&subscription_type=1&recurring_amount=770&cycles=0&frequency=6",
        "wp-user-2-1300": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+2+Users+(Duo)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Users+(Duo)&amount=1300&subscription_type=1&recurring_amount=1300&cycles=0&frequency=6",
        "wp-2user-140": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Users+R140++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+2+Users+R140++Month&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3",
        "wp-3user-210": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Users+R210++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Users+R210++Month&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3",
        "wp-4user-270": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Users+R270+Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+R270++Month&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3",
        "wp-user-4-2200": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+4+Users+(Family+Package)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+(Family+Package)&amount=2200&subscription_type=1&recurring_amount=2200&cycles=0&frequency=6",
        "mfc-2-accounts": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=2+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Accounts&amount=148&subscription_type=1&recurring_amount=148&cycles=0&frequency=3",
        "mfc-3-accounts": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=3+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Accounts&amount=222&subscription_type=1&recurring_amount=222&cycles=0&frequency=3",
        "mfc-4-accounts": "https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=4+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Accounts&amount=296&subscription_type=1&recurring_amount=296&cycles=0&frequency=3"
    };

    // Check if the selected plan has a valid payment link
    const redirectUrl = paymentLinks[selectedPlan];

    if (!redirectUrl) {
        alert("Invalid subscription plan selected.");
        return;
    }

    // Send the form data via fetch to Basin
    fetch("https://usebasin.com/f/6bf879e2d496", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Redirect to the specific payment link after successful form submission
            window.location.href = redirectUrl;
        } else {
            alert("Something went wrong. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was an error submitting the form. Please try again.");
    });
});

