app.controller('starCtrl', function($scope) {


    var arr = ['.labelat', '.labelhe', '.labelle', '.labelpre', '.labelpro'];
    var at_rating = "";
    var he_rating = "";
    var le_rating = "";
    var pre_rating = "";
    var pro_rating = "";

	// set stars as active when they are clicked
    $.each(arr, function(index, value) {
        $(value).click(function() {
            $(value).removeClass('active');
            $(this).addClass('active');
        });
    });


    $(document).ready(function() {
        $(".sendreview").click(function() {

            at_rating = $('input[name="Atmosphere"]:checked').val();
            he_rating = $('input[name="Helpfulness"]:checked').val();
            le_rating = $('input[name="Lectures"]:checked').val();
            pre_rating = $('input[name="Preparation"]:checked').val();
            pro_rating = $('input[name="Professionalism"]:checked').val();

            if (at_rating == undefined || he_rating == undefined || le_rating == undefined || pre_rating == undefined || pro_rating == undefined) {
                // error message not all ratings
                alert("this is where an error message would be if they didnt fill in all ratings");
            } else if (!$("#reviewtxt").val() || $("#reviewtxt").val().length < 50) {
                // error message text field empty or not enough characters
                alert("this is where an error message would be if the text field is empty or there were not enough characters");
			} else if(0 != 0) {
				
				// probably the cursing algorithm
			} else {
                $(".alert").show();
                // insert to db
                alert("this is where we will insert all the info to the db");

            }
        });
    });

    $('#reviewModal').on('hidden.bs.modal', function() {
		// refresh to see new review on review page
        location.reload();
    })


});