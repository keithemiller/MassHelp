$(document).ready(function() {
	// Accordion stuff////////////////////////////
	function close_accordion_section() {
		$('.accordion .accordion-section-title').removeClass('active');
		$('.accordion .accordion-section-content').slideUp(300).removeClass('open');
	}

	$('.accordion-section-title').click(function(e) {
		// Grab current anchor value
		var currentAttrValue = $(this).attr('href');
		
		if($(e.target).is('.active')) {
			close_accordion_section();
		}
		else {
			close_accordion_section();
			//$(this).animate({left:'50px'},1000);
			// Add active class to section title
			$(this).addClass('active');
			// Open up the hidden content panel
			$('.accordion ' + currentAttrValue).slideDown(300).addClass('open');
		}
		e.preventDefault();
	});
	
	////////////////////////////////////
	//Navbar
	$('.nav-bar-options').click(function(e){
		id = $(e.target).attr('id');
		id = id + '1';
		id = $(document.getElementById(id));
		
// TODO: May need to CLEAN UP: with switch
		with ($('#health1')){
			removeClass('show');
			addClass('hide');
		}
		with ($('#legal1')){
			removeClass('show');
			addClass('hide');
		}
		with ($('#nutrition1')){
			removeClass('show');
			addClass('hide');
		}
		$(id).removeClass('hide');
		$(id).addClass('show');
	});
});